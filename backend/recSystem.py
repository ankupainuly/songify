

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.metrics.pairwise import cosine_similarity
from tqdm import tqdm
from sklearn.cluster import KMeans
import warnings
warnings.filterwarnings("ignore")


def normalize_column(songs,col):
    songs[col] = (songs[col] - songs[col].min()) / (songs[col].max() - songs[col].min())  

def preprocessData(songs):
    
    print("PREPROCESSING DATA")
    num_types = ['int16', 'int32', 'int64', 'float16', 'float32', 'float64']
    num = songs.select_dtypes(include=num_types)
    num.fillna(value = 0,inplace = True)
    for col in num.columns:
        normalize_column(songs,col)


    #K-Means clustering for genre classification
    km = KMeans(n_clusters=7)
    cat = km.fit_predict(num)
    songs['cat'] = cat
    normalize_column(songs,'cat')
    
    return songs

class SpotifyRecommender():
    def __init__(self, rec_data):
        #our class should understand which data to work with
        self.rec_data_ = rec_data
    
    #if we need to change data
    def change_data(self, rec_data):
        self.rec_data_ = rec_data
    # num_types = ['string']
    # non_num_col=songs.select_dtypes(include=num_types)

    #function which returns recommendations, we can also choose the amount of songs to be recommended
    def get_recommendations(self, songid, amount=1):
        print("MANHATTAN DIST MODEL EXECUTING")
        distances = []
        songVector = self.rec_data_[(self.rec_data_.id == songid)].head(1)
        song=songVector.values[0]
        #dropping the data with our song\
        
        res_data = self.rec_data_[self.rec_data_.id != songid]
        res_data=res_data[res_data.cat==res_data.cat.values[0]]
        for r_song in tqdm(res_data.values):
            dist = 0
            for col in np.arange(len(res_data.columns)):
                #indeces of non-numerical columns
                if not col in [0,3, 8,9, 14,16]:
                    #calculating the manhettan distances for each numerical feature
                    dist = dist + np.absolute(float(song[col]) - float(r_song[col]))
            distances.append(dist)
        res_data['distance'] = distances
        #sorting our data to be ascending by 'distance' feature
        res_data = res_data.sort_values('distance')
        columns = ['artists', 'name','id']
        return res_data[columns][:amount]

def find_songVector(viz_songs,songs,id):
        return viz_songs.loc[songs['id']==id]
def find_recommendations(songs,id):
    
    print("COSINE SIM MODEL EXECUTING")
    viz_songs=songs.drop(columns=['id', 'name', 'artists'])
    song_vec=find_songVector(viz_songs,songs,id)
    # print(song_vec)
    sim_viz_songs=viz_songs[viz_songs.cat==song_vec.cat.values[0]]
    # print(sim_viz_songs)
    sim_viz_songs.fillna(value = 0,inplace = True)
    sim=cosine_similarity(sim_viz_songs,song_vec)
    scores=list(enumerate(sim))
    sorted_scores=sorted(scores,key=lambda x:x[1],reverse=True)  #sorts all the songs in the list in reverse order (decreasing order)
    sorted_scores=sorted_scores[1:]                               #skips the first index as it is the same song with highest similarity
    # print(len(sorted_scores))
    # print(scores)
    rec_songs=pd.DataFrame()
    for i in range(0,5):
        indx=sorted_scores[i][0]
        rec_songs=rec_songs.append(songs.loc[indx])       #adds all song title according to the scores found
    return rec_songs #returns the songs


def getRecommendations(songs,songid):

    # recommender = SpotifyRecommender(songs)
    
    # recc=recommender.get_recommendations(songid, 5)
    # print("at line 98 - " + songid)
    # print(songs.loc[songs['id']==songid].cat)
    recc=find_recommendations(songs,songid)
    return recc

  

