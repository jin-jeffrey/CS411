import React, { Component } from "react";
import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

class Login extends Component {

    constructor() {
        super();

        const token = this.getQueryVariable('access_token')

        if (token) {
            spotifyApi.setAccessToken(token);
        }

        this.state = {
            isSignedIn: token ? true : false,
            token: token,
            playlists: [],
            playlist: '',
            artist: ''
        };

        this.getQueryVariable = this.getQueryVariable.bind(this);
        this.getTokenValue = this.getTokenValue.bind(this);
        this.getPlaylists = this.getPlaylists.bind(this);
        this.sendData = this.sendData.bind(this);
    }

    getQueryVariable (variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("?"); 
        for (var i=0; i < vars.length; i++) {
            var pair = vars[i].split("=")
            if (pair[0] === variable) {
                return pair[1];
            }
        }
        return false;
    }

    getTokenValue () {
        return ('' + this.state.token)
    }

    async getPlaylists () {
        const url = 'http://localhost:1234/userinfo/' + this.getTokenValue();
        fetch(url)
        .then(response => response.json())
        .then(data => {
            this.state.playlists = data.items
            console.log(this.state.playlists)
        })
        .catch(error => console.log(error));
    }

    sendData () {
        this.props.loginCallback({token: this.state.token, playlist: this.state.playlist, artist: this.state.artist});
    }

    render() {
        return ( 
            <div>
                { this.state.isSignedIn === true ?
                <div>
                    <button onClick={() => window.location=this.props.baseServerUrl + '/login'}>Switch Accounts</button>
                    <button onClick={() => this.getPlaylists()}>Get Playlists</button>
                </div> :
                <button onClick={() => window.location=this.props.baseServerUrl + '/login'}>Login to Spotify</button> 
                }
                {/* temporary way to send data from child to parent via callback, will be changed when song selection is implemented */}
                <button onClick={() => this.sendData()}>send data</button>
            </div>
        );
    }
}

export default Login;


