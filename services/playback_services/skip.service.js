const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');

const skip = async (req, res) => {

    try {
        // your application requests authorization
        let access_token = getAuth();
        let authOptions = {
            url: 'https://api.spotify.com/v1/me/player/next',
            method: 'post',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

        axios(authOptions)
            .then(function (response) {
                if (response.status === 204) {
                    res.send("Skipped");
                    console.log("Skipped");
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
    skip
}