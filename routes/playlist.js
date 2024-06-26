const express = require('express');
const router = express.Router();

// Import controllers
const {playlistController} = require('../controllers');

router.get('/create', playlistController.newPlaylist);
router.get('/playlist', playlistController.getPlaylist);
router.get('/user', playlistController.getUserPlaylists);
router.get('/add', playlistController.enqueue);
router.get('/delete', playlistController.removeItem);

module.exports = router;