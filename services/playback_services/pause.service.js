const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');

const pause = async (req, res) => {
    // pause via URL call to express

    try {
        let response = await pause_api_call();
        if (response === 204) {
            console.log("Playback resumed.");
            res.redirect("http://localhost:8080/");
        }

    } catch (error) {
        console.log(error);
    }
}

const pause_api_call = async () => {
    // make call to spotify API requesting pause
    try {
        let access_token = getAuth();
        let authOptions = {
            url: 'https://api.spotify.com/v1/me/player/pause',
            method: 'put',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

        // return status of spotify API call
        let response = await axios(authOptions)
        return response.status
        
    } catch (error) {
        if ('response' in error) {
            return error.response.status;
        } else {
            console.log(error);
        }

    }
}

module.exports = {
    pause,
    pause_api_call
}