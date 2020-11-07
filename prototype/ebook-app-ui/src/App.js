import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import SearchForm from './SearchForm';

const baseServerURL = "http://localhost:1234";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {currentArtist: '', currentSong: '', lyrics: ''};

    // binding required for 'this' to work in callback
    this.getLyrics = this.getLyrics.bind(this);
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

  async signIn() {
    const url = `${baseServerURL}/login`

    fetch(url)
  }

  //html goes below
  render() {
    return (
      <div className='container'>
        <h2>Playlist to ebook App</h2>
        <button onClick={()=>window.location=`${baseServerURL}/login`}>Login to Spotify</button>
        <SearchForm onSubmit={this.getLyrics} />
        <div>
          {this.state.lyrics}
        </div>
      </div>
    );
  }



}

export default App;
