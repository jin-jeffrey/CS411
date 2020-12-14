import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from './Login';
import SelectionForm from './SelectionForm';

const baseServerURL = "http://localhost:1234";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {token: ''};

    // binding required for 'this' to work in callback
  
    this.getToken = this.getToken.bind(this);
  }

  getToken (userToken) {
    this.setState({token: userToken})
  }

  //html goes below
  render() {
    let showForm;
    if (this.state.token) {
      showForm = <SelectionForm baseServerUrl = {`${baseServerURL}`} token = {this.state.token} />;
    } else {
      showForm = "";
    }

    return (
      <div className='container'>
        <center>
        <h1>BookTunes</h1>
        <Login baseServerUrl = {`${baseServerURL}`} tokenCallback = {this.getToken} />
        
        {showForm}  
        </center>
      </div>
    );
  }

}

export default App;
