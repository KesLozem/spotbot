const { get_track } = require('../../services/playback_services/currentTrack.service');
const { pause_api_call } = require('../../services/playback_services/pause.service');
const { play_api_call } = require('../../services/playback_services/play.service');
const { skip_api_call } = require('../../services/playback_services/skip.service');
const { getId, get_queue_change, get_fallback_change, set_queue_change, set_fallback_change } = require('../../services/playlist_services/playlist_utils');
const { sleep } = require('../../utils');
require('dotenv').config();


const slack_pause = async ({message, say}) => {
    // pause playback when message is just "pause"
    if (message.text.trim() === '!pause') {
        let response = await pause_api_call();
        if (response >= 200 && response < 300) {
            await say("Playback paused");
        } else {
            await say(`Error - code: ${response}`);
        }
    }
}

const non_slack_play_call = async () => {
    const msg = '!play';
    const say_fnc = async (text = '') => {
        return new Promise((resolve) => resolve())
    }
    slack_play({message: msg, say: say_fnc})
}

const slack_play = async ({message, say}) => {
    // resume playback when message is just "play"
    if (message.text.trim() === '!play') {
        var response;
        if (get_queue_change()) {
            // Switch to queue playlist if song has been queued
            let playlist_id = getId();
            response = await play_api_call(`spotify:playlist:${playlist_id}`);
            if (response >= 200 && response < 300) {set_queue_change(false);}
        } else if (get_fallback_change()) {
            // Switch to fallback playlist if queue has been cleared
            let playlist_id = process.env.FALLBACK_PLAYLIST_ID;
            response = await play_api_call(`spotify:playlist:${playlist_id}`);
            if (response >= 200 && response < 300) {set_fallback_change(false);}
        } else {
            // Otherwise just play from currrent playlist and position
            response = await play_api_call();
        }
        if (response >= 200 && response < 300) {
            await say("Playback resumed");
        } else if (response === 403) {
            await say("Error 403 - Please check queue isn't empty");
        } else {
            await say(`Error - code: ${response}`);
        }
    }
}

const slack_skip = async ({message, say}) => {
    // Skip current track by sending "skip"

    // Only allow message that is just 'skip' (allowing for spaces)
    if (message.text.trim() === '!skip') {

        // Make spotify API call to skip
        let response = await skip_api_call();

        // check if successfully skipped
        if (response.status >= 200 && response.status < 300) {
            await sleep(700)
            // If so, try get new playing song
            let playing_res = await get_track()
            if (playing_res.status === 200) {
                // return name of song and successful skip
                await say(`Successfully skipped. Now Playing: ${playing_res.data.item.name}`)
            } else {
                // otherwise alert of error
                await say(`Successfully skipped current track. However, issue occurred getting new track - code ${playing_res.status}`)
            }

        } else {
            // otherwise say error code
            await say(`Error - code: ${response.status}`)
        }
    }
}

module.exports = {
    slack_pause,
    slack_play,
    slack_skip
}