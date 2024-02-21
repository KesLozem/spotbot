const axios = require('axios');
const { setAuth, getRefresh } = require('./store_auth.service');
querystring = require('querystring');
require('dotenv').config();

client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

const refresh = async (req, res) => {
  // requesting access token from refresh token
  
  let refresh_token = getRefresh();
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    method: 'post',
    headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    data: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }),
    json: true
  };

  axios(authOptions)
    .then(function (response) {
      if (response.status === 200) {
        let access_token = response.data.access_token;
        setAuth(access_token)
        console.log({
          'access_token': access_token
        });
        res.redirect("http://localhost:8080/")
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}
module.exports = {
  refresh
};