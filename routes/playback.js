const express = require('express');
const router = express.Router();

// Import controllers
const {playbackController} = require('../controllers');

// Login routes
router.get('/pause', playbackController.pausePlayback);
router.get('/play', playbackController.resumePlayback);
router.put('/device', playbackController.setDeviceID);
router.get('/state', playbackController.getState);
router.get('/track', playbackController.getTrack);
router.get('/next', playbackController.skipNext);
router.get('/previous', playbackController.skipPrev);



module.exports = router;