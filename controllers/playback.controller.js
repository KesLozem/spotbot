const {pause} = require('../services/playback_services/pause.service');
const {play} = require('../services/playback_services/play.service');

const pausePlayback = (req, res) => {
    try {
        pause(req, res);
    } catch (error) {
        console.log(error);
    }
}

const resumePlayback = (req, res) => {
    try {
        play(req, res);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    pausePlayback,
    resumePlayback
}