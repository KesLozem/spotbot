const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const { getId } = require('./playlist_utils');


const remove = async (req, res) => {

    try {
        // your application requests authorization
        let track_uri = req.query.uri

        let response = await remove_api_call(track_uri)

        if (response.status === 200) {
            console.log(response.data);
            res.redirect("http://localhost:8080/");
        }

    } catch (error) {
        console.log(error);
    }
}

const remove_api_call = async (uri) => {
    try{
        let access_token = getAuth();
        let playlist_id = getId();
        let track_uri = uri;
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

        return await axios(authOptions)
    } catch (error) {
        if ('response' in error) {
            return error.response
        }
        else {
            console.log(error)
        }        
    }
}

module.exports = {
    remove,
    remove_api_call
}