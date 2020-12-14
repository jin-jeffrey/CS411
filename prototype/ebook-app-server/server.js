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
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const uri = "mongodb+srv://" + config_data.db_user + ":" + config_data.db_password + "@cs411.nmabn.mongodb.net/ebooks?retryWrites=true&w=majority";
let connection;
(async () => {
    connection = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
})();

app.use(cors());


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const data = { a: 10, b: 2, c: 3 };

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

    console.log("DATA", data)
    res.json(data);

});

app.get('/login', function (req, res) {
    /* Spotify OAuth sign in
    Args: None
    Returns: None */
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
    /*Get Spotify access token
    Args: None
    Returns: None */
    var code = req.query.code || null;

    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            'redirect_uri': redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    }
    reqs.post(authOptions, function (error, response, body) {
        let access_token = body.access_token
        res.redirect(frontend_uri + '?access_token=' + access_token)
    })
})

app.get('/userinfo/:accesstoken', async (req, res) => {
    /* Get user's Spotify data
    Args: Spotify Access Token
    Returns: Json of user data */
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

app.get('/songs/:token/:playlistid', async (req, res) => {
    /* Get tracks from a playlist
    Args: Spotify access token, Spotify playlist ID
    Returns: Json of tracks
    Format of Return:
    {
      tracks: [
        {
        song: song1
        artist: [artist1, artist2]
        }
        {
        song: song2
        artist: [artist3, artist4]
        }
      ]
    }
    */
    let headers = {
        'Authorization': 'Bearer ' + req.params.token
    }
    let options = {
        url: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid + '/tracks',
        headers: headers,
        json: true
    }
    reqs(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let resp = body.items;
            let tracks = [];
            for (var x = 0; x < resp.length; x++) {
                let song = resp[x].track.name;
                let artists = [];
                for (var y = 0; y < resp[x].track.artists.length; y++) {
                    artists.push(resp[x].track.artists[y].name)
                }
                tracks.push({ song: song, artist: artists });
            }
            let values = { tracks: tracks }
            res.json(values)
        }
    })
});

//helper funtion for text processing and database lookup
//the parameter "text" is a string of all the lyrics combined
const processLyrics = async (text) => {
    if (text) {
        let words = text.trim().split(" ");

        //themes to choose from (destined to change)
        const romance = ["love", "like", "cute", "adorable", "baby", "babe", "amazing",
            "beautiful", "joy", "loving", "heart", "couple", "romance"];
        const horror = ["kill", "curse", "die", "dead"];
        const angst = ["hate", "anxious", "anxiety", "worry", "wreath", "helpless"];
        const adventure = ["run", "fly", "get away", "challenge", "venture", "journey", "vacation", "thrill"];
        const youngAdult = ["relationship", "life", "hope", "boy", "girl", "couple", "growth", "young", "adult", "youth"];
        const fantasy = ["demon", "magic", "sky", "ship", "explore", "dream", "fire",
            "dragon", "earth", "universe"];

        let romanceCounter = 0;
        let horrorCounter = 0;
        let angstCounter = 0;
        let adventureCounter = 0;
        let youngAdultCounter = 0;
        let fantasyCounter = 0;

        if (words.length > 0) {
            for (let i = 0; i < words.length; i++) {
                if (romance.includes(words[i])) {
                    romanceCounter += 1;
                } else if (horror.includes(words[i])) {
                    horrorCounter += 1;
                } else if (angst.includes(words[i])) {
                    angstCounter += 1;
                } else if (adventure.includes(words[i])) {
                    adventureCounter += 1;
                } else if (youngAdult.includes(words[i])) {
                    youngAdultCounter += 1;
                } else if (fantasy.includes(words[i])) {
                    fantasyCounter += 1;
                }
            }

            let result = "";
            const maxCount = Math.max(romanceCounter, horrorCounter, angstCounter, adventureCounter, youngAdultCounter, fantasyCounter);
            if (maxCount === romanceCounter) {
                result = "romance";
            } else if (maxCount === horrorCounter) {
                result = "horror";
            } else if (maxCount === angstCounter) {
                result = "angst";
            } else if (maxCount === adventureCounter) {
                result = "adventure";
            } else if (maxCount === youngAdultCounter) {
                result = "youngAdult";
            } else if (maxCount === fantasyCounter) {
                result = "fantasy";
            } else {
                result = "not found";
            }

            return result;
        } else {
            return "not found";
        }

        //console.log(result);
        /*result = [{title:"Harry Potter", author:"J.K. Rowling", eBookUrl: "www.google.com"},
        {title:"Romeo and Juliet", author:"Shakespeare", eBookUrl: "www.yahoo.com"},
        {title:"The Meaning of Science", author:"Tim Lewens", eBookUrl: "www.apple.com"}];*/
    }
}

app.post('/lyrics', async (req, res) => {
    console.log("BODYYY", req.body);
    let lyricsText = "";
    //get lyrics

    
    let tracks = req.body.tracks;
    if (tracks) {
        for (let i = 0; i < tracks.length; i++) {
            let url = "https://api.lyrics.ovh/v1/" + tracks[i].artist[0] + "/" + tracks[i].song;
            let response = await fetch(url);
            let data = await response.json();

            if (data.lyrics) {
                lyricsText += ' ' + data.lyrics;
            }
        }
    }
    
    //console.log("LYRICS", lyricsText);
    //call helper method that processes lyrcis and returns one predefined "theme"

    //in the helper method, get ebook data from database and return that data
    let Ourtheme = await processLyrics(lyricsText);

    console.log(Ourtheme);


    let collection = connection.db("ebooks").collection("themes");

    let result = await collection.find({"Themes": Ourtheme}).toArray();

    let bookResult = [];
    if (result.length > 0) {

        let doc = result[0];
        let books = doc.ebooks;

        let i = Math.floor(Math.random() * books.length);
        let j = (i + 1) % books.length;
        let k = (j + 1) % books.length;
        let id_i = new ObjectId(books[i]);
        let id_j = new ObjectId(books[j])
        let id_k = new ObjectId(books[k])
        let collectionEbook = connection.db("ebooks").collection("ebooks");

        console.log(id_i, id_j, id_k);
        bookResult = await collectionEbook.find({"_id":{$in:[id_i, id_j, id_k]}}).toArray();
        console.log(bookResult);
    } 

    //we have to eventually send back the ebook data to the frontend
    res.json({theme: Ourtheme,
        books: bookResult});
    
});

app.listen(1234, () => {
    console.log("http://localhost:1234");
});
