const express = require('express');
var cors = require('cors');
const fetch = require('node-fetch');
const { request } = require('express');
const reqs = require('request');
const app = express();
const config_data = require('./config.json')
const client_id = config_data.client_id;
const client_secret = config_data.client_secret;
const redirect_uri = config_data.redirect_uri;
const frontend_uri = config_data.frontend_uri;

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

app.get('/callback', function (req, res) {
    var code = req.query.code || null;

    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            'redirect_uri': redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id+':'+client_secret).toString('base64'))
        },
        json: true
    }
    reqs.post(authOptions, function (error,response, body) {
        let access_token = body.access_token
        res.redirect(frontend_uri + '?access_token=' + access_token)
    })
})

app.get('/userinfo/:accesstoken', async (req, res) => {
    let access_token = req.params.accesstoken;
    
    let headers = {
        'Authorization': 'Bearer ' + access_token
    };

    let authOptions = {
        url: 'https://api.spotify.com/v1/me',
        headers: headers,
        json: true
    };

    reqs(authOptions, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let user_id = body.id;

            let playlistOptions = {
                url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
                headers: headers,
                json: true
            };

            reqs(playlistOptions, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    res.json(body)
                }
            })
        }
    });
})

app.listen(1234, () => {
    console.log("http://localhost:1234"); 
});
