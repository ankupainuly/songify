from concurrent.futures import process
import os
import re
from django.shortcuts import render
from django.http import HttpResponse
import json
# Create your views here.
from django.views.decorators.csrf import csrf_exempt
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import pandas as pd
import json
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from recSystem import getRecommendations,preprocessData
# Fetch the service account key JSON file contents
cred = credentials.Certificate('./secret.json')
# Initialize the app with a service account, granting admin privileges

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'databaseURL': "https://songify-a8613-default-rtdb.firebaseio.com"
    })

ref = db.reference('/users')
docs=ref.get()
for key,value in docs.items():
    print(key)
    print("\n")

currentUser = ""

#spotipy--
client_credentials_manager = SpotifyClientCredentials(client_id="30f12fba8afd48bba37450e79a1dc1da", client_secret="f6da9786d86c40128214f6ce8368ce2f")
sp = spotipy.Spotify(client_credentials_manager = client_credentials_manager)


songs = pd.read_csv("data.csv")

# songs=songs.drop(['year','release_date'], axis = 1)
print(songs.columns)
@csrf_exempt

def findRatedItems(df,currUserId):
    df=df.loc[currUserId]
    df=df.index[df==1]
    return df
    

def findSimilarUsers(songs,df):
    
    simUsers=pd.DataFrame()
    for song in songs:
        simUsers=simUsers.append(df.loc[df[df[song]==1].index])

    simUsers = simUsers.loc[~simUsers.index.duplicated(keep='first')]
    return simUsers

def find_user_user_Similarity(similarUsers,currUser):

    # print("SIMILARITY BETWEEN")
    sim_scores=cosine_similarity(currUser,similarUsers)
    df=pd.DataFrame(sim_scores,columns=similarUsers.index)
    df=df.transpose()

    df=df.sort_values(by=df.columns[0],ascending=False)
    # print(df)
    return df

def getCollabRecommendation(uSim,user_user,ratedSongs):
    
    df=pd.DataFrame()
    user_user=user_user.drop(ratedSongs,axis=1) #drop curr user's liked songs from dataframe
    for user in uSim.index:
        df=df.append(user_user.loc[user])       #adding other users' liked songs to new dataframe
    
    sim_songs=df.mean(axis=0)                   #calc avg/mean of each column
    
    sim_songs=sim_songs[sim_songs!=0]           #discarding all zero liked songs in the series
    sim_songs.sort_values(ascending=False,inplace=True) #sorting the songs in desc values
    # print(sim_songs.index)                            
    return sim_songs


def make_user_user_dataset(request,slug):
    songs= pd.read_csv("data.csv")
    songs.set_index('id')
    user_user=pd.DataFrame(columns=songs['id'])
    user_user = user_user.loc[:,~user_user.columns.duplicated()]
    userId=slug
    
    for key,value in docs.items():
        user=pd.DataFrame(columns=songs['id'])
        user = user.loc[:,~user.columns.duplicated()]
        user.loc[key,:]=0
        
        if('likedSongs' in value):
            for song in value['likedSongs']:
                songId=value['likedSongs'][song]['songId']
                user.loc[key,songId]=1    

        user_user = user_user.loc[~user_user.index.duplicated(keep='first')]
        user_user= user_user.append(user)
        # print("NEW USER \n")
    # user_user_trans=user_user.transpose()
    user_user.fillna(value = 0,inplace = True)
    # print(user_user.shape)
    # user_user_trans.to_csv('user_user.csv',header=True, index=True)
    print("Completed SAVING USER USER TABLE")
    ratedSongs=findRatedItems(user_user,userId)
    similarUsers=findSimilarUsers(ratedSongs,user_user)
    similarUsers.drop([userId],axis=0)
    # print("SHAPE OF SIM USERS: ")
    # print(similarUsers.shape)
    # # print(user_user.loc[['r0B86Bwa6pROwTptgWgKqZMy3uK2'],:].shape)
    
    
    uSimDf=find_user_user_Similarity(similarUsers,user_user.loc[[userId],:])
    uSimDf.drop([userId],axis=0)
    #print(uSimDf.index)
    recc_songs=getCollabRecommendation(uSimDf,user_user,ratedSongs) #get collab recommended songs
    recc_songs_df=pd.DataFrame()
    for songid in recc_songs.index:
        recc_songs_df=recc_songs_df.append(songs[(songs.id == songid)])
    
    print("COLLAB RECCOMMENDED SONGS")
    # recc_songs_df.set_index('name')
    recc_songs_df.reset_index(inplace=True)
    print(recc_songs_df)
    return HttpResponse(recc_songs_df['id'].to_json())


def index(request):
    if request.method == "GET":
        print("GET REQ INIT")
        #print(docs)
        return HttpResponse(json.dumps(docs), content_type="application/json")
    elif request.method == "POST":
        val=json.loads(request.body)
        print("POST requested")
        print(val['text'])
        
        return HttpResponse("POST REQ")

def fetchUserSongs(request,slug):
    if request.method == "GET":
        global songs
        Songs=preprocessData(songs)
        likedSongs=pd.DataFrame({})
        # print(docs[slug])
        for key,value in docs[slug]['likedSongs'].items():
            songid=value['songId']
            df=getRecommendations(Songs,songid)
            likedSongs=likedSongs.append(df,ignore_index = True)

        # print(likedSongs)
        return HttpResponse(likedSongs['id'].to_json())

@csrf_exempt
def getTrackFeatures(request) :
        if request.method == "GET":
            trackId = request.GET.get('trackId','')
            if((songs['id']==trackId).any()):
                print("TRACK EXISTS")
            else:
                extractFeatures(trackId)
        return HttpResponse("Added Song")

def extractFeatures(trackId):
    global songs
    track = sp.audio_features(trackId)
    trackMData=sp.track(trackId)
    print(trackMData)
    trackDf=pd.DataFrame(track)
    trackDf=trackDf.drop(['track_href','analysis_url','uri','type','time_signature'], axis = 1)
    trackDf['name']=trackMData['name']
    trackDf['popularity']=trackMData['popularity']
    trackDf['explicit']=trackMData['explicit']
    trackDf['artists']=trackMData['artists'][0]['name']
    print(trackDf.columns)
    songs=pd.concat([songs,trackDf],ignore_index=True)   
    songs = songs.reset_index(drop=True)
    print(songs.shape)         
    songs.to_csv('data.csv',header=True, index=False)
    