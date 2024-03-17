const axios = require('axios');
const querystring = require('querystring');
const { setUserId } = require('../playlist_services/playlist_utils');
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
      data: querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      }),
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    try{
      let response = await axios(authOptions);
      if(response.status === 200){
        let access_token = response.data.access_token,
          refresh_token = response.data.refresh_token;

        let options = {
          url: 'https://api.spotify.com/v1/me',
          method: 'get',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        let display_name = await axios(options)
          .then(function (response) {
            setUserId(response.data.id);
            return response.data.id;
          });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));

        payload = {
          display_name,
          tokens: {
            access_token,
            refresh_token
          }
        };

        return payload;

      } else {
        res.redirect('/token/' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    } catch (error) {
      console.log(error);
    }    
  }
};

module.exports = {
  callback,
}