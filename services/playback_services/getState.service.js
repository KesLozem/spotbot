const axios = require('axios');

const state = async (req, res) => {

    try {
        // your application requests authorization
        let access_token = req.query.access_token;
        let authOptions = {
            url: 'https://api.spotify.com/v1/me/player/',
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

        axios(authOptions)
        .then(function (response) {
            if (response.status === 204) {
                res.send("No Current Playback device");
                console.log("No Current Playback device");
            } else if (response.status === 200) {
                body = response.data;
                res.send(`Current Device: ${body.device.name}.\n Currently: ${body.is_playing? "playing." : "paused."}`);
                console.log(`Current Device: ${body.device.name}.\n Currently: ${body.is_playing? "playing." : "paused."}`);
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