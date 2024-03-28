const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const { getDeviceId } = require('./device.store');

const prev = async (req, res) => {

    try {
        // your application requests authorization
        let access_token = getAuth();
        let device_id = getDeviceId();
        let authOptions = {
            url: 'https://api.spotify.com/v1/me/player/previous',
            method: 'post',
            headers: { 'Authorization': 'Bearer ' + access_token },
            params: {'device_id': device_id},
            json: true
        };

        axios(authOptions)
        .then(function (response) {
        if (response.status === 204) {
            console.log("Skipped to previous track.");
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
    prev
}