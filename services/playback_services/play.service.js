const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
require('dotenv').config();

const play = async (req, res) => {
    // resume playback

    try {
        let response = await play_api_call();
        if (response === 204) {
            console.log("Playback resumed.");
            res.redirect("http://localhost:8080/");
        }

    } catch (error) {
        console.log(error);
    }
}

const play_api_call = async () => {
    // make call to spotify API endpoint to resume playback

    try {
        let access_token = getAuth();
        let authOptions = {
            url: 'https://api.spotify.com/v1/me/player/play',
            method: 'put',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

        
        // return whether API call was successful
        let response = await axios(authOptions).catch( (error) => {
            if ('response' in error) {
                if (error.response.status === 404) {
                    authOptions.params = {
                        'device_id': process.env.DEFAULT_DEVICE_ID 
                    }
                    return axios(authOptions)
                } else {
                    return error.response;
                }
            } else {
                console.log(error)
            }     
        })
        console.log(response.status)
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
    play,
    play_api_call
}