const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');

const state = async (req, res) => {

    try {
        
        // get response from API call
        let response = await state_api_call();

        if (response.status === 204) {
            console.log("No Current Playback device");
            res.redirect("http://localhost:8080/");
        } else if (response.status === 200) {
            body = response.data;
            console.log(`Current Device: ${body.device.name}.\n Currently: ${body.is_playing? "playing." : "paused."}`);
            res.redirect("http://localhost:8080/");
        }        



    } catch (error) {
        console.log(error);
    }
}

const state_api_call = async () => {
    try {
        // your application requests authorization
        let access_token = getAuth();
        let authOptions = {
            url: 'https://api.spotify.com/v1/me/player/',
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

        return await axios(authOptions).catch((error) => {
            if ('response' in error) {
                return error.response
            } else {
                console.log(error)
            }

        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    state,
    state_api_call
}