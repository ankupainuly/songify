import React, { Component } from 'react'
//---------------------------------------------------------------------------
import { FaPlay,FaPause,FaStepForward,FaStepBackward } from "react-icons/fa";
import { ImPlay2,ImPrevious,ImPause,ImNext } from "react-icons/im";
import "../Styles/Player.css"
//---------------------------------------------------------------------------
import audio1 from "../assets/audio1.mp3";
//---------------------------------------------------------------------------
import Cookies from 'universal-cookie'
//---------------------------------------------------------------------------
export default class AudioPlayer extends Component {
    
    constructor(props)
    {
        super(props);

        const cookies=new Cookies();
        const PlayerState=cookies.get("playerState")
        this.state={
            outerPlayer:false,
            playing:false,
            duration:PlayerState.duration,
            currentTime:0
        }
        
        //references
        this.audioRef=React.createRef();    //audio player reference
        this.progressBar=React.createRef(); //progress bar reference 
        this.animationRef=React.createRef(); //animation reference
        console.log(this.audioRef)
        //binding this to methods
        this.togglePlayPause=this.togglePlayPause.bind(this);
        this.updateMetaData=this.updateMetaData.bind(this);
        this.changeRange=this.changeRange.bind(this);
        this.whilePlaying=this.whilePlaying.bind(this);

      
    }
    componentWillReceiveProps(props){
        this.setState({playing:false});
    }
    updateMetaData()
    {
        var seconds=Math.floor(this.audioRef.current.duration);
        var time=this.calculateTime(seconds);
        
        //set progress bar range equal to duration of song
        this.progressBar.current.max=seconds; 
        
        const cookies=new Cookies();
        const PlayerState=cookies.get("playerState")
        PlayerState.duration=time;
        cookies.set("playerState",PlayerState,{ path: '/' });

        this.setState({duration:time});
    }
    calculateTime(seconds){

        const minutes=Math.floor(seconds/60);

        const returnedMinutes=minutes<10?`0${minutes}`:`${minutes}`;
        const secs=Math.floor(seconds%60);

        const returnedSeconds=secs<10?`0${secs}`:`${secs}`;

        return `${returnedMinutes}:${returnedSeconds}`;

        
    }
    togglePlayPause(){

        //prevValue of playing
        var prevValue=this.state.playing;
        
        var player=document.getElementById("bottom-player-image");
        
        // toggle the playing state
        this.setState({playing:!prevValue});
        
        
        //use the current audioPlayer reference
        var audioPlayer=this.audioRef;
        
        if(!prevValue)
        {
            audioPlayer.current.play();
            player.classList.remove("resume");
            player.classList.add("paused");

            this.animationRef.current=requestAnimationFrame(this.whilePlaying);
        }
        else{   
            
            audioPlayer.current.pause();
            player.classList.remove("paused");
            player.classList.add("resume");

            //stop animation for seek time
            cancelAnimationFrame(this.animationRef.current);
        }

    }
    whilePlaying()
    {
        const cookies=new Cookies();
        const PlayerState=cookies.get("playerState")
        //change progressbar seek to song time
        this.progressBar.current.value=this.audioRef.current.currentTime;
        
        this.progressBar.current.style.setProperty("--seek-before-width", `${this.progressBar.current.value/this.state.duration * 100}%`)
        
        //change song time
        PlayerState.currentTime=this.progressBar.current.value;
        cookies.set("playerState",PlayerState,{ path: '/' });
        this.setState({currentTime:this.progressBar.current.value});

        //call animation again
        this.animationRef.current=requestAnimationFrame(this.whilePlaying);
        
    }
    changeRange(){

        //change song time to progress bar seek
        this.audioRef.current.currentTime=this.progressBar.current.value;
        
        this.progressBar.current.style.setProperty("--seek-before-width", `${this.progressBar.current.value/this.state.duration * 100}%`)
        //change song time
        this.setState({currentTime:this.progressBar.current.value});

    }
   
    render() {
        const cookies=new Cookies();
        const {nowPlaying, playingSongLink,playingSongImage,playingArtist}=cookies.get("playerState")
        console.log(cookies.get("playerState").isPlaying)
        if(cookies.get("playerState").isPlaying === false)
        {
            console.log("NOT SHOWING")
            return <div></div>
        }
        return (
            <div >
                
                <div className="fixed-bottom navbar-light bg-light" style={{justifySelf: "flex-end"}}>
                
                <div className="card  bottom-player" >
                    <div className="row g-0">
                        <div className="col-sm-1">
                            <img src={playingSongImage} className="img-fluid bottom-player-image rounded-start" alt="Source Image" id="bottom-player-image"/>
                        </div>
                        <div className="col-sm-2">
                            <div className="card-body">
                                <h5 className="card-title"
                                     style={{
                                        height: "20px",
                                        width: "100px",
                                        overflow: "hidden"
                                    }}
                                >{nowPlaying}</h5>
                                <p className="card-text "
                                     style={{
                                        height: "20px",
                                        width: "60px",
                                        overflow: 'hidden'
                                    }}
                                >{playingArtist}</p>
                                
                            </div>
                        </div>
                        <div className="col-md-9 bottom-controls">
                        <div className="card-body">
                            <ImPrevious className="control"/>
                            {this.state.playing === false &&
                                <ImPlay2 onClick={this.togglePlayPause} className="control"/>
                            }
                            {
                            this.state.playing === true &&
                                <ImPause onClick={this.togglePlayPause} className="control"/>
                            }
                            <ImNext className="control"/>
                            <div className="bottom-player-seekbar">
                                <audio  onLoadedMetadata={this.updateMetaData} ref={this.audioRef} id="audio" src={playingSongLink} preload="metadata" > </audio> 
                                            
                                    <div className="duration">
                                                
                                    {/* Curr time */}
                                    <span className="currTime"> {this.calculateTime(this.state.currentTime)}</span>
                                                
                                    {/* Duration */}
                                    <span className="endTime">{this.state.duration}</span>
                                    </div>
                                                
                                    {/* Progress Bar */}
                                    <div>
                                        <input className="bottom-progessbar" onChange={this.changeRange} ref={this.progressBar} defaultValue="0" type="range" />
                                    </div>
                            </div>
                        </div>                  
                        </div>
                    </div>
                </div>
                    
                
                </div>
            </div>
        )
    }
}

class OuterPlayer extends React.Component {

    render() {
        return(
        <div className="player-outer">
            <div className="bs-container container-fluid d-flex justify-content-center align-items-center">
                <div class="card mb-3  player-card" >
                    <div class="row g-0  ">
                        <div class="col-md-5 image-col">
                            <img src="https://tinyurl.com/3j2fduea" class="img-fluid player-image" id="play-img" alt="Album Art"/>
                        </div>
                        <div class="col-md-7 player-col">
                            <div class="card-body ">
                                <h5 class="player-text-title subtitle card-title">Now Playing</h5>
                                <p class="player-text subtitle card-text">Genius</p>
                                <p class="player-text subtitle card-text"><small class="text-muted">Sia ft Diplo</small></p>
                                        

                                <audio  onLoadedMetadata={this.updateMetaData} ref={this.audioRef} id="audio" src={audio1} preload="metadata" > </audio> 
                                        
                                <div className="duration">
                                            
                                {/* Curr time */}
                                <span className="currTime"> {this.calculateTime(this.state.currentTime)}</span>
                                            
                                {/* Duration */}
                                <span className="endTime">{this.state.duration}</span>
                                </div>
                                            
                                {/* Progress Bar */}
                                <div>
                                    <input onChange={this.changeRange} ref={this.progressBar} defaultValue="0" type="range" className="control-range"/>
                                </div>

                                {/* Controls */}
                                <div className="controls-outer">
                                            
                                <FaStepBackward className="control"/>
                                {this.state.playing === false &&
                                    <FaPlay onClick={this.togglePlayPause} className="control"></FaPlay>
                                }
                                {
                                    this.state.playing === true &&
                                    <FaPause onClick={this.togglePlayPause} className="control"/>
                                }
                                    <FaStepForward className="control"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> 
            </div>
        </div>
    )}
}
