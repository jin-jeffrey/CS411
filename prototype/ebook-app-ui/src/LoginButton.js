import React, { Component } from "react";


class LoginButton extends Component {

    constructor() {
        super();
        const params = this.getHashParams();
        this.state = {
            loggedIn: params.access_token ? true : false,
            token: params.access_token
        }
    }

    getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    async getPlaylists() {
        const url = this.props.baseServerURL + '/playlist/:' + this.state.token;

        fetch(url)
          .then(response => response.json())   
          .then(data => {
            console.log(data);     
          })
          .catch(error => console.error(error));
    
      }

    render() {
        return ( 
            <div>
                <button onClick={() => window.location=this.props.baseServerUrl + '/login'}>Login to Spotify</button>
                <button onClick={() => this.getPlaylists()}>Get Playlists</button>
            </div>
        );
    }
}

export default LoginButton;


