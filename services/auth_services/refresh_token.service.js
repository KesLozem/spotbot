const axios = require('axios');
const { setAuth, getRefresh } = require('./store_auth.service');
const { sleep } = require('../../utils');
querystring = require('querystring');
require('dotenv').config();

client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

const refresh = async (req, res) => {

  // try to get new access token
  let response = await refresh_call();

  if (response.status === 200) {
    let access_token = response.data.access_token;
    setAuth(access_token)
    console.log({
      'access_token': access_token
    });
    res.redirect("http://localhost:8080/")
  }

  
}

const refresh_call = async () => {

  // Parameters for API call
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

  // Try to get access token from refresh token
  return axios(authOptions)    
    .catch(function (error) {
      if ('response' in error) {
        return error.response;
      } else {
        console.log(error);
    }
    });
}

const auto_refresh = async () => {
  await sleep(55 * 60 * 1000)
  try {
    let response = await refresh_call()
    if (response.status === 200) {
      let access_token = response.data.access_token;
      setAuth(access_token)
      console.log(`Automatically Refreshed Access Token.
      New Token: ${access_token}`);
    } else {
      console.log(`Error with automatic refresh call - code ${response.status}`)
    }
  } catch (error) {
    console.log(error)
  }

  auto_refresh();

}
module.exports = {
  refresh,
  auto_refresh
};