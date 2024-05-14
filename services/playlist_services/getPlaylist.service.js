const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const { getId } = require('./playlist_utils');


const playlist = async (req, res) => {
    // Print current playlist to console (accessed via URL)

    try {
        await playlist_tracks();
        res.redirect("http://localhost:8080/");    

    } catch (error) {
        console.log(error);
    }
}

const playlist_name = async (id) => {
    //make api call to get playlist name
    let access_token = getAuth();
    let authOptions = {
        url: 'https://api.spotify.com/v1/playlists/' + id,
        method: 'get',
        headers: { 
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };

    try {
        let response = await axios(authOptions)
        return response.data.name
    } catch (error) {
        console.log(error)
    }

}

const playlist_tracks = async (start_pos = 0, limit = 50, uri = null) => {
    
    // Make call to spotify API using relevant information
    let access_token = getAuth();
    var playlist_id;
    if (uri) {
        playlist_id = uri;
    } else {
        playlist_id = getId();
    }
    let authOptions = {
        url: 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks',
        method: 'get',
        headers: { 
            'Authorization': 'Bearer ' + access_token
        },
        params: {
            offset: start_pos,
            limit: limit
        },
        json: true
    };


    let response = await axios(authOptions)

    // extract and return track
    // console.log(response.data)
    return response.data

}

module.exports = {
    playlist,
    playlist_tracks,
    playlist_name
}