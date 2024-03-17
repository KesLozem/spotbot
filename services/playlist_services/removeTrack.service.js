const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const { getId } = require('./playlist_utils');


const remove = async (req, res) => {

    try {
        // your application requests authorization
        let access_token = getAuth();
        let playlist_id = getId();
        let track_uri = req.query.uri;
        let authOptions = {
            url: 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks',
            method: 'delete',
            headers: { 
                'Authorization': 'Bearer ' + access_token
            },
            data: {
                uris: [track_uri]
            },
            json: true
        };

        axios(authOptions)
        .then(function (response) {
        if (response.status === 200) {
            console.log(response.data);
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
    remove
}