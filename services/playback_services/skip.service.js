const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const { getDeviceId } = require('./device.store');

const next = async (req, res) => {
    // URL based API call to skip song
    try {

        let response = await skip_api_call() // make spotify API call
        if (response.status === 204) {
            console.log("Skipped to next track.");
            res.redirect("http://localhost:8080/");
        }

    } catch (error) {
        console.log(error);
    }
}

const skip_api_call = async () => {
    // Function to make API call to skip current track

    try {
        let access_token = getAuth(); // get access token
        let device_id = getDeviceId();
        // spotify skip API and relevant info
        let authOptions = {
                url: 'https://api.spotify.com/v1/me/player/next',
                method: 'post',
                headers: { 'Authorization': 'Bearer ' + access_token },
                params: {'device_id': device_id},
                json: true
            };
        return await axios(authOptions)
    } catch (error) {
        // if axios error from spotify API call, return response code
        if ('response' in error) {
            return error.response;
        } else {
            console.log(error);
        }
    }


}

module.exports = {
    next,
    skip_api_call
}