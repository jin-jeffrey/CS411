import React, { Component } from "react";


class SearchForm extends Component {
 
    constructor(props) {
        super(props);
        this.state = {currentArtist:'', currentSong:''};

        this.updateArtist = this.updateArtist.bind(this);
        this.updateSong = this.updateSong.bind(this);
        this.handleSubmit   = this.handleSubmit.bind(this);

    }

    componentDidMount(){
        
    }

    updateArtist(e) {
        this.setState({currentArtist: e.target.value});
    }

    updateSong(e) {
        this.setState({currentSong: e.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.onSubmit(
            {currentArtist: this.state.currentArtist, 
                currentSong: this.state.currentSong});
    }


  render() {
    return ( 

        <div className="container">

            <h3>Enter Song Info</h3>
            <form  onSubmit={this.handleSubmit}>
                    <div className="form-group row">
                        <label htmlFor="id1" className="col-sm-2 col-form-label">Artist Name</label>
                        <div className="col-sm-10">
                            <input type="text" value={this.state.currentArtist}
                                    onChange= {this.updateArtist}
                                    placeholder="Enter Artist Name" 
                                    className="form-control"
                                    id="id1" required/>
                        </div>
                    </div>

                    <div className="form-group row">
                        <label htmlFor="id2" className="col-sm-2 col-form-label">Song Name</label>
                        <div className="col-sm-10">
                            <input type="text" value={this.state.currentSong}
                                    onChange= {this.updateSong}
                                    placeholder="Enter Song Name" 
                                    className="form-control"
                                    id="id2" required/>
                        </div>
                    </div>

                    <div className="form-group row">
                        <div className="col-sm-10">
                        <button type="submit" className="btn btn-primary">Get Lyrics!</button>
                        </div>
                    </div>

    	    </form>
        
        </div>
      
    );
  }
}

export default SearchForm;


