const express = require('express');
const router = express.Router();

// Import controllers
const {playbackController} = require('../controllers');

// Login routes
router.get('/pause', playbackController.pausePlayback);
router.get('/play', playbackController.resumePlayback);
router.put('/device', playbackController.setDeviceID);


module.exports = router;