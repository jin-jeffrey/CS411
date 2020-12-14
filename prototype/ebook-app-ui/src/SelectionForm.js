import React, { Component } from "react";


class SelectionForm extends Component {
 
    constructor(props) {
        super(props);
        this.state = {playlist:[], playlistTracks:[], eBooks:[], theme:""};
        this.baseServerUrl = props.baseServerUrl;
        console.log("BSURL", this.baseServerUrl);

        this.getPlaylists = this.getPlaylists.bind(this);
        this.getPlaylistTracks = this.getPlaylistTracks.bind(this);
        this.getTrackLyrics = this.getTrackLyrics.bind(this);
        this.handleSubmit   = this.handleSubmit.bind(this);
        this.startOver = this.startOver.bind(this);

    }

    componentDidMount(){
        
    }


    handleSubmit(event) {
        event.preventDefault();
        this.props.onSubmit(
            {currentArtist: this.state.currentArtist, 
                currentSong: this.state.currentSong});
    }

    startOver(event) {
        event.preventDefault();
        this.setState({playlist:[], playlistTracks:[], eBooks:[], theme:""});
    }

    async getPlaylists(event) {
        event.preventDefault();
        const url = this.baseServerUrl + '/userinfo/' + this.props.token;
        
        fetch(url)
        .then(response => response.json())
        .then(data => {
            this.setState({playlist: data.items});
        })
        .catch(error => console.log(error));
    }

     
    async getPlaylistTracks(event) {
        event.preventDefault();
        var val = event.target.elements['playlist'].value;
        const url = this.baseServerUrl + '/songs/' + this.props.token + '/' + val;

        fetch(url)
        .then(response => response.json())
        .then(data => {
            this.setState({playlistTracks: data.tracks});
        })
        .catch(error => console.log(error));
        
    }
 
    

    async getTrackLyrics(event) {
        event.preventDefault();
       
        let form = new FormData(event.target);
        let ids = form.getAll("tracks");
        let selectedTracks = [];
        for (let i = 0; i < ids.length; i++) {
            let currentIndex = ids[i];
            selectedTracks.push(this.state.playlistTracks[currentIndex]);
        }

        const url = this.baseServerUrl + '/lyrics'
        const options = {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({tracks: selectedTracks})
      };


      let response =  await fetch(url, options);
      let data =      await response.json();
      let theme = data.theme;
      theme = theme[0].toUpperCase() + theme.substr(1);
      this.setState({eBooks: data.books,theme: theme});
       
    }


  render() {
      let showGetTracks;
      let showGetEBooks;
    return ( 

        <div className="container">
            <form onSubmit = {this.getPlaylists}>
            <button className ="btn btn-primary">Get Playlists</button>
            </form>
            {this.state.playlist.length > 0 &&
            <div>
                <h3>Select a Playlist:</h3>
                <div>
                    <form onSubmit = {this.getPlaylistTracks}> 
                    {
                        this.state.playlist.map((pl, index) => (
                            <span key={pl.id}>
                            <input type="radio" id={pl.id} name="playlist" value={pl.id}></input>
                            <label htmlFor={pl.id}>{pl.name}</label><br></br>
                            
                            </span>
                        ))
                    }
                        <button type="submit" className ="btn btn-primary">Get Tracks!</button>
                    </form>   
                </div>
            </div>
            }


            {this.state.playlistTracks.length > 0 &&
            <div>
                <h3>Select Songs:</h3>
                <div>
                    <form onSubmit = {this.getTrackLyrics}> 
                    {
                        this.state.playlistTracks.map((song, index) => (
                            <span key={index}>
                            <input type="checkbox" id={index} name="tracks" value={index}></input>
                            <label htmlFor={index}><strong>{song.song}</strong> by <em>{song.artist[0]}</em></label><br></br>
                            
                            </span>
                        ))
                    }
                        <button type="submit" className ="btn btn-primary">Get EBooks!</button>
                    </form>   
                </div>
            </div>
            }

            {this.state.eBooks.length > 0 &&
            <div>
             <h3>Recommended eBooks for {this.state.theme} Theme:</h3>
                    {
                        this.state.eBooks.map((book, index) => (
                            <span key={index}>
                            <p>
                                <b>Title: </b>{book.Title}<br></br>
                                <b>Author: </b>{book.Author}<br></br>
                                <a href={book.URL} target ='_blank'><b>Click here to read!</b></a><br></br>
                            </p>
                            </span>
                        ))
                    }
                    <form onSubmit = {this.startOver}><button type="submit" className ="btn btn-primary">Start Over!</button></form>
            
            
            </div>
            }
        
        </div>
      
    );
  }
}

export default SelectionForm;


