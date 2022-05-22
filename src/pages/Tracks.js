import React, { Component } from 'react';
import axios from 'axios';

import { BrandNav } from './Main';

import "../Styles/Tracks.css"
import ReactLoading from 'react-loading';
import AudioPlayer from './AudioPlayer';
import { auth, db, } from "../services/firebase";
import Cookies from 'universal-cookie';
import { useHistory } from "react-router-dom";

class Tracks extends Component {
    constructor(props)
    {
        super(props);
        const cookies= new Cookies();
        const {
            nowPlaying,
            playingSongImage,
            isPlaying,
            playingSongLink,
            playingArtist}=cookies.get("playerState");


        this.state={
            limit: 5,
            recentlyLikedSong: "",
            userId: auth().currentUser.uid,
            playListId: "",
            nowPlaying,
            playingSongImage,
            isPlaying,
            playingSongLink,
            playingArtist,
            recSongsIds: "",
            rec_tracks: [],
            tracks: [],
            rec_ids: [],
            loading:true
        }
        this.setPlayList = this.setPlayList.bind(this)
        this.togglePlaying = this.togglePlaying.bind(this);
    }

    setTrack(tracks) {
        this.setState({tracks: tracks, loading: false})
    }

    async setPlayList(data) {
        const cookies = new Cookies()
        try {
            await axios({
                url: 'https://api.spotify.com/v1/playlists/'+data+'?limit=10',
                method: 'GET',
                headers: {
                  "Authorization": "Bearer " + cookies.get("access_token"),
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                },
              }).then(response => {
                    // console.log(response)
                    const tracksArray = [];
                    response.data.tracks.items.map((song) => {
                        if(song.track.preview_url) {
                            tracksArray.push(song.track)
                        }
                    })
                    this.setTrack(tracksArray)
                    }
              );
          } catch (error) {
            console.log(error);
          }
    }
    async fetchGeneralTracks(cookies,id)
    {
        try {
            await axios({
                url: 'https://api.spotify.com/v1/browse/categories/'+id+'/playlists?limit=10',
                method: 'GET',
                headers: {
                  "Authorization": "Bearer " + cookies.get("access_token"),
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                },
              }).then(response => {
                  //this.setCategories(response.data.categories.items)
                  //console.log(response)
                  this.setPlayList(response.data.playlists.items[0].id)
              }).catch(function(error) {
                  console.log(error)
                  alert("Couldn't find "+id+" playlist...")
              });
          } catch (error) {
            console.log(error);
          }
    }


    async fetchRecommendedSongs(cookies,id)
    {
        var {history}=this.props;
        var url
        console.log("ID IS "+ id)
        if(id === "CONTENT-COSINE")
            url="http://localhost:8000/getRecommendations/content/cos/"
        else if(id === "CONTENT-MAN")
            url="http://localhost:8000/getRecommendations/content/man/"
        else
            url="http://localhost:8000/getRecommendations/collab/"
        
        console.log("URL IS"+url)
        try {
            await axios({
                url: url+auth().currentUser.uid,
                method: 'GET',
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                },
              }).then(response => {
                  
                  console.log("DATA RECEIVED")
                //   console.log(response.data)
                //   this.setState({rec_ids: response.data})
                    this.fetchFromSpotify(cookies,response.data)
 
              }).catch(function(error) {
                  console.log(error)
                  alert("Couldn't Generate Recommendations, kindly like some songs first.")
                  history.push("/")
              });
              
          } catch (error) {
            console.log(error);
          }
    }
    
    async fetchFromSpotify(cookies,rec_songs)
    {
        for(var id in rec_songs) {
            console.log(id)
            if(rec_songs[id] === null) continue
            await axios({
                url: 'https://api.spotify.com/v1/tracks/'+rec_songs[id],
                method: 'GET',
                headers: {
                  "Authorization": "Bearer " + cookies.get("access_token"),
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                },
              }).then(response => {
                  //this.setCategories(response.data.categories.items)
                  
                  if(response.data.preview_url)
                  this.state.rec_tracks.push(response.data)
              }).catch(function(error) {
                  console.log(error)
                  alert("Couldn't find "+id+" playlist...")
              });
          }
          this.setTrack(this.state.rec_tracks)
          console.log(typeof this.state.tracks)


    }
    loadMoreSongs(){
        if(this.state.limit + 5 > this.state.tracks.length) {
            document.getElementById("load_more").style.display = 'none'
            this.setState({limit: this.state.tracks.length})
        }
        else {
            this.setState({limit: this.state.limit + 5})
        }
        //LOGIC TO LOAD MORE SONGS ONTO THE SCREEN
    }
    async componentDidMount() {
        const cookies = new Cookies()
        const id = this.props.location.state.id
        
        if(id === "CONTENT-COSINE" ||id === "CONTENT-MAN" || id === "COLLAB")        //content based recommendations and collaborative recommendations
        {
            this.fetchRecommendedSongs(cookies,id)
        }
             

        else
        {
            this.fetchGeneralTracks(cookies,id)
        }
    }

    togglePlaying(index, playerState)
    {
        const {tracks}=this.state;
        
        const newState={nowPlaying:tracks[index].name,
            playingSongImage:tracks[index].album.images[0].url,
            playingSongLink:tracks[index].preview_url,
            playingArtist: tracks[index].artists[0].name,
            isPlaying:true};

        this.setState({
            nowPlaying:tracks[index].name,
            playingSongImage:tracks[index].album.images[0].url,
            playingSongLink:tracks[index].preview_url,
            playingArtist: tracks[index].artists[0].name,
            isPlaying:true
        })

            const cookies= new Cookies();
            cookies.set("playerState",newState);
            //console.log(cookies.get("playerState"))
    }

    render() {
        console.log(this.props.location.state.id)
        const {tracks,loading}=this.state;
        let playerState="tracks-list list-group";
        if(this.state.isPlaying)
            playerState+=" show-player";
        else
            playerState+=" hide-player"
        return (            
            <div className="track-container">
                <BrandNav/>
                <p className="tracks-title">Iconic handpicked songs</p>
                <p className="tracks-subtitle">Just for you</p>
                <div style={{"textAlign":"center"}}>
                <button type="button" class="tracks-play-botton btn btn-secondary btn-lg" onClick={()=>this.togglePlaying(0)}>Play Now</button>
                </div>
                {loading&& <div className="loading-indicator">
            <ReactLoading type="spin" color="gold" height={'3%'} width={'3%'}/>
        </div>}
                <div ref={this.playerRef} className={playerState}>
                {tracks.slice(0,this.state.limit).map((song,index)=>(
                    // console.log(song),
                        <TracksMenu
                            songTitle = {song.name.indexOf('(') >= 0? song.name.substring(0,song.name.indexOf('(')).trim():song.name}
                            songArtist = {song.artists[0].name}
                            songImage = {song.album.images[0].url}
                            songLink = {song.preview_url}
                            songId = {song.id}
                            index = {index}
                            onClick = {()=>this.togglePlaying(index)}
                        />

                ))}
                
                <button type="button" id="load_more" class="tracks-load-botton btn-secondary btn-lg btn-block" onClick={()=>this.loadMoreSongs()}>Load More...</button>
                
                </div>
                {this.state.isPlaying &&
                <AudioPlayer/>
                }
            </div>
        );
    }
}

export default Tracks;


class TracksMenu extends Component {
    constructor(props) {
        super(props)
        this.state = {
            user: auth().currentUser.uid,
            liked: false,
        }
        this.onLikeCliked = this.onLikeCliked.bind(this)
    }

    async componentDidMount() {
        try {
            //console.log("fetching liked songs")
            db.ref("users")
            .child(this.state.user)
            .child("likedSongs")
            .orderByChild("songTitle")
            .equalTo(this.props.songTitle)
            .on("value", (snapshot) => {
                //console.log(snapshot.val())
              if (snapshot.exists()) {
                this.setState({liked: true})
                //console.log("found")
              } else {
                this.setState({liked: false}) 
                //console.log("not-found")
              }
            });
        }
        catch(error) {
            this.setState({error: error.message});
        }
    }

    async onLikeCliked(event) {
        event.preventDefault();
        //console.log(this.props.songLink)
        var userId = this.state.user
        var title = this.props.songTitle
        var songid=this.props.songId
        //console.log(title)
        if(this.state.liked === false) {
            try {
                await axios({
                    url: `http://localhost:8000/getTrackFeatures`,
                    method: 'GET',
                    params: {
                        trackId: songid
                    },
                    headers: {
                      "Accept": "application/json",
                      "Content-Type": "application/json",
                    },
                  }).then(res => {
                      //const cookies = new Cookies()
                        console.log(res)
                    })
                await db.ref("users").child(userId).child("likedSongs").child(title).set({
                        songTitle: title,
                        songArtist: this.props.songArtist,
                        songImage: this.props.songImage,
                        songLink: this.props.songLink,
                        songId: this.props.songId,
                    }
                );
                this.setState({liked: true})
                
                await db.ref("users").child(userId).child("recentlyLikedSong").set({
                    songId: this.props.songId,
                    }
                );
            }
            catch(error) {
            console.log(error.message);
            }
        }
        else {
            try {
                await db.ref("users").child(userId).child("likedSongs").child(title).set(null);
                this.setState({liked: false})
            }
            catch(error) {
            console.log(error.message);
            }
        }
    }

    render() {
        const {songTitle,songArtist} = this.props;

        let TrackLiked = 'track-'
        this.state.liked ? TrackLiked += 'liked' : TrackLiked += 'not-liked'
        return (
            <div className='song-container'>
                <p onClick={this.props.onClick} href="#" class="track-single list-group-item  " aria-current="true">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="track-text mb-1">{songTitle}</h5>
                        <button type='button' className={TrackLiked + " btn btn-secondary btn-lg"} onClick={this.onLikeCliked}/> 
                    </div>
                    <p class="track-text mb-1">{songArtist}</p>

                </p>

            </div>
        )
    }
}
