const express = require('express');
var cors = require('cors');
const fetch = require('node-fetch');

const app = express();

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

app.listen(1234, () => {
    console.log("http://localhost:1234"); 
});