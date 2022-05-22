import React, { Component } from 'react';
import axios from 'axios';
import "../Styles/Categories.css"
import { db, auth } from '../services/firebase';
import {TracksMenu} from './Tracks'
import AudioPlayer from './AudioPlayer';
import { Link } from "react-router-dom";
import Cookies from 'universal-cookie';
import Tracks from './Tracks';



export default class Categories extends Component {
  
    constructor(props) {
//
        super(props);
        this.state={
            categories: [],
            likedSongs: [],
            rec_cat:    ["Mix 1","Mix 2"],
            rec_cat_image:["https://www.onlinelogomaker.com/blog/wp-content/uploads/2017/06/music-logo-design.jpg"],
            rec_cat_id:["CONTENT-COSINE","CONTENT-MAN"]
        }
        this.setCategories = this.setCategories.bind(this)
        this.setRecCategories = this.setRecCategories.bind(this)
        this.togglePlaying = this.togglePlaying.bind(this)
    }

    togglePlaying(index, playerState)
    {
        const {likedSongs}=this.state;
        
        const newState={nowPlaying:likedSongs[index].songTitle,
            playingSongImage:likedSongs[index].songImage,
            playingSongLink:likedSongs[index].songLink,
            playingArtist: likedSongs[index].songArtist,
            isPlaying:true};

        this.setState({
            nowPlaying:likedSongs[index].songTitle,
            playingSongImage:likedSongs[index].songImage,
            playingSongLink:likedSongs[index].songLink,
            playingArtist: likedSongs[index].artistName,
            isPlaying:true
        })

            const cookies= new Cookies();
            cookies.set("playerState",newState);
            console.log(index)
    }

    setCategories(data) {
        this.setState({categories: data})
    }

    setRecCategories(data) {
        this.setState({rec_cat: data})
    }

    async componentDidMount() {
        const cookies = new Cookies()
        try {
            await axios({
                url: 'https://api.spotify.com/v1/browse/categories?country=US',
                method: 'GET',
                headers: {
                  "Authorization": "Bearer " + cookies.get("access_token"),
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                },
              }).then(response => {
                  this.setCategories(response.data.categories.items)
                //   console.log(this.state.playList)
              }).catch(function(error) {
              });

            db.ref("users")
            .child(auth().currentUser.uid)
            .child("likedSongs")
            // .equalTo("likedSongs")
            .on("value", (snapshot) => {
                var temp = []
                //console.log(snapshot.val())
              snapshot.forEach(element => {
                //   console.log(element.val())
                  temp.push(element.val())
              }
              )
              this.setState({likedSongs: temp});
            });
          } catch (error) {
            console.log(error);
          }
    }

   

    render() {
    const {categories,rec_cat,rec_cat_image,rec_cat_id,likedSongs} = this.state;
    return (
        <div className="Cat-Container">
            
            
            {/* <Recommended/> */}
            <div className="cat-row row row-cols-1 row-cols-md-6 g-4">
            <p className="cat-title">Popular Categories</p>
            {
                categories.map(data =>{
                    //console.log(index);
                    return <Category title={data?.name} image={data?.icons[0].url} id={data.id}/>
                })
            }
            <a className="cat-title cat-more">See More...</a>
            </div>

            <div className="cat-row row row-cols-1 row-cols-md-6 g-4">
            <p className="cat-title">Recommended for you</p>
            {
                rec_cat.map((name,index) =>{
                    //console.log(index);
                    return <Category title={name} image={rec_cat_image[0]} id={rec_cat_id[index]}/>
                })
            }
            <a className="cat-title cat-more">See More...</a>
            </div>
            <div className="cat-row row row-cols-1 row-cols-md-6 g-4">
            <p className="cat-title">You May Also Like</p>
            
                
                <Category title={rec_cat[0]} image={rec_cat_image[0]} id={"COLLAB"}/>
                
            
            <a className="cat-title cat-more">See More...</a>
            </div>
            <div className="cat-row row row-cols-1 row-cols-md-6 g-4">
            <p className="cat-title">Songs You Have Liked</p>
            {
                likedSongs.map((data,i) =>{
                    // console.log(data);
                    return <LikedSongs title={data.songTitle} image={data.songImage} artist={data.songArtist} onClick={() => this.togglePlaying(i)}/>
                })
            }
            <a className="cat-title cat-more">See More...</a>
            </div>
            {this.state.isPlaying &&
                <AudioPlayer/>
            }
        </div>
    )
  }
}

class LikedSongs extends Component {
    render() {
        const {title,image,artist}=this.props;
        
        return (
            <Link>
                <div className="col" onClick={this.props.onClick}>
                    <div class="category card bg-dark text-white">
                        <img src={image} class="card-img" alt="..."/>
                        <div class="card-img-overlay">
                            <h5 class="card-title">{title}</h5>
                            <h6 class='card-title'>{artist}</h6>
                        </div>
                    </div>
                </div>
            </Link>
        )
      }
}

class Category extends Component {
  
    render() {
    const {title,image,id}=this.props;
    
    return (

        <Link to={{
            pathname: "/tracks",
            state: {
                ['id']: id
            }
        }}>
            <div className="col">
                <div class="category card bg-dark text-white">
                    <img src={image} class="card-img" alt="..."/>
                    <div class="card-img-overlay">
                        <h5 class="card-title">{title}</h5>
                    </div>
                </div>
            </div>
        </Link>
    )
  }
}




