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
            albums: {name:'', id:''}
        };
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
            console.log(data)
        })
        .catch(error => console.log(error));
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
            </div>
        );
    }
}

export default Login;


