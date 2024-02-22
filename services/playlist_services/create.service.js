const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const { setId } = require('./storeID.service');
require('dotenv').config();

const user_id = process.env.USER_ID;

const create = async (req, res) => {

    try {
        // your application requests authorization
        let access_token = getAuth();
        let authOptions = {
            url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
            method: 'post',
            headers: { 
                'Authorization': 'Bearer ' + access_token,
                "Content-Type": "application/json" 
            },
            data: {
                "description": "Playlist for slack spotify bot queue",
                "name": "SpotBot Playlist",
                "public": false
            },
            json: true
        };

        axios(authOptions)
        .then(function (response) {
        if (response.status === 201) {
            id = response.data.uri.split(':')[2]
            console.log(`Created Playlist\n ID: ${id}`);
            setId(id);
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
    create
}