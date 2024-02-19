const express = require('express');
const router = express.Router();

// Import controllers
const {playbackController} = require('../controllers');

// Login routes
router.get('/pause', playbackController.pausePlayback);
router.get('/play', playbackController.resumePlayback);


module.exports = router;