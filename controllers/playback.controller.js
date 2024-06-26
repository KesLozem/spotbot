const {pause} = require('../services/playback_services/pause.service');
const {play} = require('../services/playback_services/play.service');
const {state} = require('../services/playback_services/getState.service');
const {track} = require('../services/playback_services/currentTrack.service');
const {next} = require('../services/playback_services/skip.service');
const {prev} = require('../services/playback_services/prev.service');


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

const getState = (req, res) => {
    try {
        state(req, res);
    } catch (error) {
        console.log(error);
    }
}

const getTrack = (req, res) => {
    try{
        track(req, res);
    } catch (error) {
        console.log(error);
    }
}

const skipNext = (req, res) => {
    try{
        next(req, res);
    } catch (error) {
        console.log(error);
    }
}

const skipPrev = (req, res) => {
    try{
        prev(req, res);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    pausePlayback,
    resumePlayback,
    getState,
    getTrack,
    skipNext,
    skipPrev
}