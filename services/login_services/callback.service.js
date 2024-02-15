const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = process.env.REDIRECT_URI; // Your redirect uri
const client_id = process.env.CLIENT_ID; // Your client id

let stateKey = 'spotify_auth_state';

const callback = async (req, res) => {

  // your application requests refresh and access tokens
  // after checking the state parameter

  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      data:  querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      }),
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    axios(authOptions)
      .then(function (response) {
        if (response.status === 200) {

          //console.log(response.data)

          let access_token = response.data.access_token,
            refresh_token = response.data.refresh_token;

          authToken = access_token;

          let options = {
            url: 'https://api.spotify.com/v1/me',
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };

          // use the access token to access the Spotify Web API
          axios(options)
            .then(function (response) {
              console.log(response.data);
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
};

module.exports = {
  callback
}