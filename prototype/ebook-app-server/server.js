const express = require('express');
var cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const client_id = '4ebacdebdf854fec86afc40543d6dbdf';
const redirect_uri = 'http://localhost:3000';


app.use(cors());

const data = {a:10, b:2, c:3};

//REST endpoints
app.get("/", (req, res) => {
    res.type("application/json");
    res.send(data);
});

app.get("/lyrics/:artist/:song", async (req, res) => {

    let currentArtist = req.params.artist;
    let currentSong = req.params.song;

    let response = await fetch("https://api.lyrics.ovh/v1/" + currentArtist + "/" + currentSong);
    let data = await response.json();
    console.log("https://api.lyrics.ovh/v1/" + currentArtist + "/" + currentSong);
    console.log("DATA", data)
    res.json(data);

});

// Spotify OAuth endpoint
app.get('/login', function(req,res) {
    var scopes = 'user-read-email playlist-read-private playlist-read-collaborative';
    res.redirect('https://accounts.spotify.com/authorize' + 
    '?response_type=code' + 
    '&client_id=' + client_id +
    '&scope=' + encodeURIComponent(scopes) + 
    '&redirect_uri=' + encodeURIComponent(redirect_uri) +
    // if show_dialog set to false, users would not have to approve app again 
    '&show_dialog=true'); 
});

app.get("/playlists/:token", function(req,res) {
    let token = req.params.token;

    fetch('https://accounts.spotify.com/api/token', {
        method: 'post',
        grant_type: 'authorization_code',
        code: token,
        redirect_uri: redirect_uri
    });
});

app.listen(1234, () => {
    console.log("http://localhost:1234"); 
});
