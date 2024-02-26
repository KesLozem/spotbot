const { create } = require("../services/playlist_services/create.service");
const { playlist } = require("../services/playlist_services/getPlaylist.service");
const { userPlaylists } = require("../services/playlist_services/getUserPlaylists.service");

const newPlaylist = async (req, res) => {
    try {
        create(req, res);
    } catch (error) {
        console.log(error);
    }
}

const getPlaylist = async (req, res) => {
    try {
        playlist(req, res);
    } catch (error) {
        console.log(error);
    }
}

const getUserPlaylists = async (req, res) => {
    try {
        userPlaylists(req, res);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    newPlaylist,
    getPlaylist,
    getUserPlaylists
}