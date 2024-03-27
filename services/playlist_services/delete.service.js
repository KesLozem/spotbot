const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const { getId } = require('./playlist_utils');

const unfollow_playlist = async () => {
    
    // Make call to spotify API using relevant information
    let access_token = getAuth();
    let playlist_id = getId(); // default = spotbot playlist
    let authOptions = {
        url: 'https://api.spotify.com/v1/playlists/' + playlist_id + '/followers',
        method: 'delete',
        headers: { 
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };

    try {
        let response = await axios(authOptions)
        return response
    } catch (error) {
        if ('response' in error) {
            return error.response
        }
        console.log(error)
    }
    

}

module.exports = {
    unfollow_playlist
}