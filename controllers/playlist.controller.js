const { get_playlist } = require('../services/playlist_services/get_playlist.service');
const { get_tracks } = require('../services/playlist_services/get_tracks.service');

const getPlaylist = (req, res) => {
    try {
        get_playlist(req, res);
    } catch (error) {
        console.log(error);
    }
}

const getTrackItems = (req, res) =>{
    try {
        get_tracks(req, res);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getPlaylist,
    getTrackItems
}