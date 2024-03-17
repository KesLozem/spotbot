const {pause} = require('../services/playback_services/pause.service');
const {play} = require('../services/playback_services/play.service');
const {putDeviceID} = require('../services/playback_services/putDeviceID.service');
const {skip} = require('../services/playback_services/skip.service');

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

const setDeviceID = (req, res) => {
    try {
        putDeviceID(req, res);
    } catch (error) {
        console.log(error);
    }
}

const skipTrack = (req, res) => {
    try {
        skip(req, res);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    pausePlayback,
    resumePlayback,
    setDeviceID,
    skipTrack
}