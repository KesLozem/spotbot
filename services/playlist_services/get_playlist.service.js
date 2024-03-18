const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const create_playlist = require('./create_playlist.service')
const { setId } = require('./playlist_utils')


// get playlist from spotify, if it doesn't exist create one.
let playlist_name = "SpotBot_Playlist"

const get_playlist = async (req, res) => {
    try {
        let access_token = getAuth();
        let authOptions = {
            url: `https://api.spotify.com/v1/me/playlists`,
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

        axios(authOptions)
            .then(function (response) {
                let playlists = response.data.items;
                let playlist_exists = false;
                for (let i = 0; (i < playlists.length) || !(playlist_exists); i++) {
                        if (playlists[i].name === playlist_name) {
                            playlist_exists = true;
                            setId(playlists[i].id);
                            console.log("Playlist already existing with ID: " + playlists[i].id);
                            res.send(`Playlist already existing with ID: ${playlists[i].id}`);
                        }                        
                }
                if (!playlist_exists) {
                    create_playlist.create_playlist(req, res);
                    console.log("Generated new playlist: SpotBot_Playlist");
                    res.send("Playlist does not exist: Created a new playlist");
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
    get_playlist
}