const axios = require('axios');

const play = async (req, res) => {

    try {
        // your application requests authorization
        let access_token = req.query.access_token;
        let authOptions = {
            url: 'https://api.spotify.com/v1/me/player/play',
            method: 'put',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

        axios(authOptions)
        .then(function (response) {
        if (response.status === 204) {
            res.send("Resumed");
            console.log("Playback resumed.");
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
    play
}