const { get_playlist } = require('../services/playlist_services/get_playlist.service');

const getPlaylist = (req, res) => {
    try {
        get_playlist(req, res);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getPlaylist
}