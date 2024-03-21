const { addItem } = require("../services/playlist_services/addTrack.service");
const { create } = require("../services/playlist_services/create.service");
const { playlist } = require("../services/playlist_services/getPlaylist.service");
const { userPlaylists } = require("../services/playlist_services/getUserPlaylists.service");
const { remove } = require("../services/playlist_services/removeTrack.service");
const { get_playlist } = require('../services/playlist_services/get_playlist.service');
const { get_tracks } = require('../services/playlist_services/get_tracks.service');

const getPlaylist1 = (req, res) => {
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
    getPlaylist1,
    getUserPlaylists,
    enqueue,
    removeItem,
    getPlaylist,
    getTrackItems
}