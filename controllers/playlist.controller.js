const { addItem } = require("../services/playlist_services/addTrack.service");
const { create } = require("../services/playlist_services/create.service");
const { playlist } = require("../services/playlist_services/getPlaylist.service");
const { userPlaylists } = require("../services/playlist_services/getUserPlaylists.service");
const { remove } = require("../services/playlist_services/removeTrack.service");

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

const enqueue = async (req, res) => {
    try{
        addItem(req, res);
    } catch (error) {
        console.log(error);
    }
}

const removeItem = async (req, res) => {
    try{
        remove(req, res);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    newPlaylist,
    getPlaylist,
    getUserPlaylists,
    enqueue,
    removeItem
}