const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const { getId } = require('./playlist_utils');


const addItem = async (req, res) => {

    try {

        // get spotify track uri from url
        let track_uri = req.query.uri;

        // queue track and get response
        const status = await add_aux(track_uri);
        if (status === 201) {
            // redirect if song queued
            res.redirect("http://localhost:8080/")
        }

        

    } catch (error) {
        console.log(error);
    }
}

const add_aux = async (uri) => {
    let access_token = getAuth(); // access_token
    let playlist_id = getId(); // default is spotbot playlist

    // spotify API request details
    let authOptions = {
        url: 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks',
        method: 'post',
        headers: { 
            'Authorization': 'Bearer ' + access_token
        },
        data: {
            uris: [uri]
        },
        json: true
    };

    // log and return spotify response
    return axios(authOptions).then(function (response) {
        if (response.status === 201) {
            console.log(response.data);
        }
        return response.status
    })
    
    
}

module.exports = {
    addItem,
    add_aux
}