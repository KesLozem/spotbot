/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
var dotenv = require('dotenv');
dotenv.config();

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
const morgan = require("morgan");
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const path = require('path');

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';
let authToken = '';

var app = express();

app.use(express.static(path.join(__dirname + '/public' + '/build')))
   .use(cors())
   .use(cookieParser())
   .use(bodyParser.json())

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-currently-playing user-modify-playback-state streaming user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        authToken = access_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/token/' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/auth/token', (req, res) => {
  res.json({access_token: authToken});
});

app.get('/logout', (req, res) => {
  authToken = '';
});

app.put('/device', (req, res) => {
  var authOptions = {
      url: 'https://api.spotify.com/v1/me/player',
      headers: { 'Authorization': 'Bearer ' + authToken },
      json: true,
      body: {
        device_ids: [req.body.device_id],
        play: true
      }
    };
    request.put(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 204) {
        res.send(JSON.stringify({ "success": "transfered playback" }));
      }
      else{
        res.send(body);
      }
    });
});

app.get('/search', (req, res) => {
  try {
    req.query.q = req.query.q.replace(/ /g || '+', '%20')
  } catch (error) {console.log(error)}
   req.query.limit = 1;
   var authOptions = {
      url: 'https://api.spotify.com/v1/search?' + 
      querystring.stringify({
         q: req.query.q,
         type: 'track',
         limit: 10
      }),
      headers: {
         'Authorization': 'Bearer ' + authToken
      },
      json: true
   };
   request.get(authOptions, function(error, response, body) {
    let searchPayload = [];    
    try {
      let trackid = '';
      let trackname = '';
      let artistname = '';
      let albumname = '';
      let imageurl = '';
      let duration_ms = '';

      for (item in body.tracks.items) {
        trackid = body.tracks.items[item].id;
        trackname = body.tracks.items[item].name;
        artistname = body.tracks.items[item].artists[0].name;
        albumname = body.tracks.items[item].album.name;
        imageurl = body.tracks.items[item].album.images[0].url;
        duration_ms = body.tracks.items[item].duration_ms;
        
        function millisToMinutesAndSeconds(ms) {
          var minutes = Math.floor(ms / 60000);
          var seconds = ((ms % 60000) / 1000).toFixed(0);
          return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        }
        duration = millisToMinutesAndSeconds(duration_ms)
        
      
        let payload = {
          trackid: trackid,
          trackname: trackname,
          artistname: artistname,
          albumname: albumname,
          imageurl: imageurl,
          duration: duration
        }
        
        searchPayload.push(payload)

      }
      if (!error && response.statusCode === 200) {
        res.send(searchPayload);      
      } else {
          console.log(error);
      }
      // console.log(body);
    } catch (error) { 
      res.send(error) 
    }
   });

   
})


app.put('/play', function(req, res) {
  var authOptions = {
     url: 'https://api.spotify.com/v1/me/player/play',
     headers: {
        'Authorization': 'Bearer ' + authToken
     },
     json: true
  };
  request.put(authOptions, function(error, response, body){
    if (!error && response.statusCode >= 200 && response.statusCode <300) {
      res.send("Success. Status: 200 OK");      
    }
    else{
      res.send(body);  
    };
  })
});

app.put('/pause', function(req, res) {
  var authOptions = {
     url: 'https://api.spotify.com/v1/me/player/pause',
     headers: {
        'Authorization': 'Bearer ' + authToken
     },
     json: true
  };
  request.put(authOptions, function(error, response, body){
    if (!error && response.statusCode >= 200 && response.statusCode <300) {
      res.send("Success. Status: 200 OK");      
    }
    else{
      res.send(body);  
    };
  })
});

// skip to previous song
app.post('/previous', function(req, res) {
  var authOptions = {
     url: 'https://api.spotify.com/v1/me/player/previous',
     headers: {
        'Authorization': 'Bearer ' + authToken
     },
     json: true
  };
  request.post(authOptions, function(error, response, body){
    if (!error && response.statusCode >= 200 && response.statusCode <300) {
      res.send("Success. Status: 200 OK");      
    }
    else{
      res.send(body);  
    };
  })
});


// skip to next song
app.post('/skip', function(req, res) {
  var authOptions = {
     url: 'https://api.spotify.com/v1/me/player/next',
     headers: {
        'Authorization': 'Bearer ' + authToken
     },
     json: true
  };
  request.post(authOptions, function(error, response, body){
    if (!error && response.statusCode >= 200 && response.statusCode <300) {
      res.send("Success. Status: 200 OK");      
    }
    else{
      res.send(body);  
    };
  })
});

// add track to queue (payload must have 'trackid')
app.post('/enqueue', function(req, res) {
  //console.log("spotify:track:"+req.body.trackid);
  var authOptions = {
     url: 'https://api.spotify.com/v1/me/player/queue?'+
     querystring.stringify({
      uri: "spotify:track:"+req.body.trackid
     }),
     headers: {
        'Authorization': 'Bearer ' + authToken
     },
     json: true
  };

  request.post(authOptions, function(error, response, body){
    if (!error && response.statusCode === 204) {
      res.send(JSON.stringify({ "success": "added track" }));    
    }
    else{
      console.log(error, response.statusCode);
      res.send(body);  
    }
  })
});

app.get('/current', function(req, res) {
  //console.log("spotify:track:"+req.body.trackid);
  var authOptions = {
     url: 'https://api.spotify.com/v1/me/player/currently-playing',
     headers: {
        'Authorization': 'Bearer ' + authToken
     },
     json: true
  };

  request.get(authOptions, function(error, response, body){
    if (!error && response.statusCode >= 200 && response.statusCode <300) {
      res.send({
        uri: response.body.item.uri,
        title: response.body.item.name,
        artist: response.body.item.artists[0].name,
        albumCover: response.body.item.album.images[0].url,
        progress_ms: response.body.progress_ms,
        duration_ms: response.body.item.duration_ms
      });      
    }
    else{
      res.send(error);  
    }
  })
});

app.get('/player', function(req, res) {
  //console.log("spotify:track:"+req.body.trackid);
  var authOptions = {
     url: 'https://api.spotify.com/v1/me/player',
     headers: {
        'Authorization': 'Bearer ' + authToken
     },
     json: true
  };

  request.get(authOptions, function(error, response, body){
    if (!error && response.statusCode >= 200 && response.statusCode <300) {
      res.send({
        activeDevice: response.body.device.id,
        isPlaying: response.body.is_playing,
        actions: response.body.actions
      });      
    }
    else{
      res.send(error, response.statusCode, body);  
    }
  })
});

app.get('/isPlaying', function(req, res) {
  var authOptions = {
     url: 'https://api.spotify.com/v1/me/player/currently-playing',
     headers: {
        'Authorization': 'Bearer ' + authToken
     },
     json: true
  };

  request.get(authOptions, function(error, response, body){
    if (!error && response.statusCode >= 200 && response.statusCode < 300) {
      res.send({ isPlaying: body.is_playing }); // Send only the is_playing attribute      
    }
    else{
      res.send(error);  
    }
  })
});

app.get('/queue', (req, res) => {
  var authOptions = {
      url: 'https://api.spotify.com/v1/me/player/queue',
      headers: {
          'Authorization': 'Bearer ' + authToken
      },
      json: true
  };


  request.get(authOptions, function(error, response, body) {
    let queuePayload = [];  
      try {
          for (let item of body.queue) {
              let trackid = item.id;
              let trackname = item.name;
              let artistname = (item.type === "track") ? item.artists[0].name : null; // null for episodes
              let albumname = (item.type === "track") ? item.album.name : null; // null for episodes
              let imageurl = (item.album && item.album.images) ? item.album.images[0].url : null;
              let duration_ms = item.duration_ms;

              function millisToMinutesAndSeconds(ms) {
                  var minutes = Math.floor(ms / 60000);
                  var seconds = ((ms % 60000) / 1000).toFixed(0);
                  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
              }

              duration = millisToMinutesAndSeconds(duration_ms);

              let payload = {
                  trackid: trackid,
                  trackname: trackname,
                  artistname: artistname,
                  albumname: albumname,
                  imageurl: imageurl,
                  duration: duration
              }
              
              queuePayload.push(payload);
          }

          if (!error && response.statusCode === 200) {
            // console.log("queuePayload: " + JSON.stringify(queuePayload));
            res.send(queuePayload);      
          } else {
              console.log(error);
          }
      } catch (error) { 
          res.send(error);
          console.log(error);
      }
  });
});



console.log('Listening on 8888');
app.listen(8888);
