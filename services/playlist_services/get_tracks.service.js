const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const { getId } = require('./playlist_utils')
const { setTracks, getTracks } = require('../../db/playlist.db')

// Dependency:
// get_playlist.service.js (for getId())

// Stores tracks in playlist.db

const get_tracks = async (req, res) => {
    try {
        let access_token = getAuth();
        let authOptions = {
            url: `https://api.spotify.com/v1/playlists/${getId()}/tracks`,
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

        axios(authOptions)
            .then(function (response) {
                let tracks = response.data.items;
                let track_list = [];
                for (let i = 0; i < tracks.length; i++) {
                    track_list.push(
                        {
                            "name": tracks[i].track.name,
                            "artist": tracks[i].track.artists[0].name,
                            "uri": tracks[i].track.uri,
                            "duration": tracks[i].track.duration_ms,
                        });
                }
                setTracks(track_list);
                res.send(track_list);
            })
            .catch(function (error) {
                console.log(error);
            });

    } catch (error) {
        console.log(error);
    }
}

module.exports = { get_tracks }