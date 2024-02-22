const express = require('express');
const router = express.Router();

// Import controllers
const {playlistController} = require('../controllers');

router.get('/create', playlistController.newPlaylist);
router.get('/playlist', playlistController.getPlaylist);

module.exports = router;