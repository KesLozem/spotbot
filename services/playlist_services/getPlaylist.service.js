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

const playlist_tracks = async () => {
    
    // Make call to spotify API using relevant information
    let access_token = getAuth();
    let playlist_id = getId(); // default = spotbot playlist
    let authOptions = {
        url: 'https://api.spotify.com/v1/playlists/' + playlist_id,
        method: 'get',
        headers: { 
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };

    let response = await axios(authOptions)

    // extract and return track
    console.log(response.data.tracks)
    return response.data.tracks

}

module.exports = {
    playlist,
    playlist_tracks
}