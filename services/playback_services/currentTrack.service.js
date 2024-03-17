const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');

const track = async (req, res) => {
    // skip track called by URL (express)
    try {
        
        let response = await get_track();
        if (response.status === 200) {
            console.log(response.data.item.name);
            res.redirect("http://localhost:8080/");
        }         


    } catch (error) {
        console.log(error);
    }
}

const get_track = async () => {
    // Make API call asking for current track
    try {
        let access_token = getAuth();
        let authOptions = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

        return axios(authOptions).catch(
            (error) => {
                if ('response' in error) {
                    return error.response;
                } else {
                    console.log(error);
                } 
            }
        )
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    track,
    get_track
}