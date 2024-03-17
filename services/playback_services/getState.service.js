const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');

const state = async (req, res) => {

    try {
        // your application requests authorization
        let access_token = getAuth();
        let authOptions = {
            url: 'https://api.spotify.com/v1/me/player/',
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

        axios(authOptions)
        .then(function (response) {
            if (response.status === 204) {
                console.log("No Current Playback device");
                res.redirect("http://localhost:8080/");
            } else if (response.status === 200) {
                body = response.data;
                console.log(`Current Device: ${body.device.name}.\n Currently: ${body.is_playing? "playing." : "paused."}`);
                res.redirect("http://localhost:8080/");
            }        
        })
        .catch(function (error) {
            console.log(error);
        });

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    state
}