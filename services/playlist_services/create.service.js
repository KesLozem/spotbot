const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const { setId } = require('./playlist_utils');
require('dotenv').config();

const user_id = process.env.USER_ID;

const create = async (req, res) => {

    // Create playlist when accessed via url (express)

    try {
        // get result of api call
        let response = await create_api_call();
        if (response.status === 201) {
            id = response.data.id
            console.log(`Created Playlist\n ID: ${id}`);
            setId(id);
            res.redirect("http://localhost:8080/");
        }


    } catch (error) {
        console.log(error);
    }
}

const create_api_call = async () => {
    // make api call to spotify
    try {
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

        return await axios(authOptions)
    } catch (error) {
        if ('response' in error) {
            return error.response;
        }
        console.log(error)
    }
}

module.exports = {
    create,
    create_api_call
}