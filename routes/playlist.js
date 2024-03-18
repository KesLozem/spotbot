const express = require('express');
const router = express.Router();

// Import controllers
const playlistController = require('../controllers/playlist.controller');

// Playlist routes
router.get('/', playlistController.getPlaylist);
router.get('/tracks', playlistController.getTrackItems);

module.exports = router;