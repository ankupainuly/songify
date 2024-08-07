import React, { Component } from 'react';
import "../Styles/Home.css";
import back from "../assets/main-landing.jpg"

import logo from "../assets/Main-Logo.png"
import Login from './Login';

class Home extends Component {
    render() {
        return (
            <div className="home-outer">
                <div className="bs-container container-fluid">
                    <div className="row">
                        <div className="col-lg-6 center-image hidden-sm hidden-xs">
                            <img className="home-back1" src={back} alt="Background Image"></img> 
                        </div>
                        
                        <div className="home-title-col  col-lg-6 col-sm-9 col-xs-12 ">
                            <div className="home-title">
                                    <img  className="home-logo" src={logo} alt="Songify Logo"/>
                                    <h2 className="title">Songify</h2>
                                    <p className="subtitle">THINK MUSIC</p>
                                    
                            </div>
                        </div>
                    </div>
                </div>
                <Login/>
            </div>
        );
    }
}

export default Home;