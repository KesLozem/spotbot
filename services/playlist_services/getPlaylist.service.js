const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const { getId } = require('./storeID.service');


const playlist = async (req, res) => {

    try {
        
        await get_tracks();
        res.redirect("http://localhost:8080/");    

    } catch (error) {
        console.log(error);
    }
}

const get_tracks = async () => {
    
    // Make call to spotify API using relevant information
    let access_token = getAuth();
    let playlist_id = getId();
    let authOptions = {
        url: 'https://api.spotify.com/v1/playlists/' + playlist_id,
        method: 'get',
        headers: { 
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };

    let response = await axios(authOptions)

    console.log(response.data.tracks)
    
    return response.data.tracks

}

module.exports = {
    playlist,
    get_tracks
}