const axios = require('axios');
const { getAuth, auth_list } = require('../auth_services/store_auth.service');
const { setId, getUserId } = require('./playlist_utils')

let playlist_name = "SpotBot_Playlist"

const create_playlist = async (req, res) => {
    try {
        let access_token = getAuth();
        let authOptions = {
            url: `https://api.spotify.com/v1/users/${getUserId()}/playlists`,
            method: 'post',
            headers: { 'Authorization': 'Bearer ' + access_token },
            data: {
                "description": "Playlist for slack spotify bot queue",
                "name": playlist_name,
                "public": false
            },
            json: true
        };

        axios(authOptions)
            .then(function (response) {
                if (response.status === 201) {
                    response.data.id = setId(response.data.id);
                    res.send("Playlist created");
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
    create_playlist
}