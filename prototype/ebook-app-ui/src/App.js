import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from './Login';
import SearchForm from './SearchForm';

const baseServerURL = "http://localhost:1234";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {currentArtist: '', currentSong: '', lyrics: '', playlist: '', artist: '', token: ''};

    // binding required for 'this' to work in callback
    this.getLyrics = this.getLyrics.bind(this);
    this.loginCallback = this.loginCallback.bind(this);
  }


  async getLyrics(songInfo) {
    console.log(songInfo);
    const url = `${baseServerURL}/lyrics/${songInfo.currentArtist}/${songInfo.currentSong}`;
    console.log(url);

    
    fetch(url)
      .then(response => response.json())   
      .then(data => {
        console.log(data);
        this.setState({lyrics: data.lyrics, currentArtist: songInfo.currentArtist, currentSong: songInfo.currentSong});
        
        
      })
      .catch(error => console.error(error));

  }

  loginCallback = (childData) => {
    this.setState({token: childData.token, album: childData.playlist, artist: childData.artist})
  }

  //html goes below
  render() {
    return (
      <div className='container'>
        <h2>Playlist to ebook App</h2>
        <Login baseServerUrl = {`${baseServerURL}`} loginCallback = {this.loginCallback} />
        <SearchForm onSubmit={this.getLyrics} />
        <div>
          {this.state.lyrics}
        </div>
        <div>
          <p>Token: {this.state.token}</p>
          <p>Artist: {this.state.artist}</p>
          <p>Playlist: {this.state.playlist}</p>
        </div>
      </div>
    );
  }



}

export default App;
