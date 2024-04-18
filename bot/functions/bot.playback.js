const { get_track, track } = require('../../services/playback_services/currentTrack.service');
const { get_queue } = require('../../services/playback_services/getQueue.service');
const { state_api_call } = require('../../services/playback_services/getState.service');
const { pause_api_call } = require('../../services/playback_services/pause.service');
const { play_api_call } = require('../../services/playback_services/play.service');
const { skip_api_call } = require('../../services/playback_services/skip.service');
const find_pos = require('../../services/playlist_services/findposition');
const { getId, get_queue_change, get_fallback_change, set_queue_change, set_fallback_change, set_fallback_pos, get_fallback_pos } = require('../../services/playlist_services/playlist_utils');
const { sleep } = require('../../utils');
const { check_skip_track, check_member_vote, add_skip_vote, get_cur_skips, get_req_skips } = require('./skipCount');
require('dotenv').config();
const fallback_id = process.env.FALLBACK_PLAYLIST_ID


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
    const msg = {text: '!play'}
    const say_fnc = async (text = '') => {
        return new Promise((resolve) => resolve())
    }
    await slack_play({message: msg, say: say_fnc})
}

const slack_play = async ({message, say}) => {
    // resume playback when message is just "play"
    if (message.text.trim() === '!play') {
        var response;
        if (get_queue_change()) {

            // Get current position in fallback playlist
            let current = await get_track();
            if (current.status === 204) {
                await pause_api_call();
                current = await get_track();
            }
            var pos = 0;
            if (current.status >= 200 && current.status < 300 && current.status != 204) {
                [pos, _] = await find_pos(current.data.item.uri, null, fallback_id);
            }
            // Switch to queue playlist if song has been queued
            let playlist_id = getId();
            response = await play_api_call(`spotify:playlist:${playlist_id}`);
            if (response >= 200 && response < 300) {
                if (pos == -1) {
                    pos = 0;
                }
                set_queue_change(false);
                set_fallback_pos(pos)
            }
        } else if (get_fallback_change()) {
            // Switch to fallback playlist if queue has been cleared
            let playlist_id = fallback_id;
            let pos = get_fallback_pos();
            response = await play_api_call(`spotify:playlist:${playlist_id}`, pos);
            if (response >= 200 && response < 300) {set_fallback_change(false);}
        } else {
            state = await state_api_call();
            if (state.status === 200 || state.status > 204) {
                if (state.data.is_playing) {
                    await say("Spotify is already playing.")
                    return;
                }
            } else {
                await say(`Error - code: ${state.status}`)
                return;
            }
            // Otherwise just play from currrent playlist and position
            response = await play_api_call();
        }
        if (response >= 200 && response < 300) {
            await say("Playback resumed");
        } else {
            await say(`Error - code: ${response}`);
        }
    }
}

const slack_skip = async ({message, say}) => {
    // Skip current track by sending "skip"

    // Only allow message that is just 'skip' (allowing for spaces)
    if (message.text.trim() === '!skip') {


        try {
            let p_res = await get_track()

            // Filter out non-votes
            if (p_res.status === 204) {
                await say('Error - no currently playing track')
                return;
            } else if (p_res.status >= 200 && p_res.status < 300) {
                // Don't let user vote twice on same track
                if (check_skip_track(p_res.data.item.uri)){
                    if (check_member_vote(message.user)) {
                        await say(`<@${message.user}> has already voted to skip ${p_res.data.item.name}!`)
                        return;
                    }
                }
            }

            // Process vote
            add_skip_vote(message.user);
            await say(`<@${message.user}> has voted to skip ${p_res.data.item.name}!`)
            let [cur_votes, req_votes] = [get_cur_skips(), get_req_skips()]
            let votes_needed = req_votes - cur_votes;
            if (votes_needed > 0) {
                await say(`Votes needed for skip: ${votes_needed} (Current count: ${cur_votes}/${req_votes})`)
            } else {
                await say(`Vote threshold (${req_votes}) reached. Skipping track...`)
                // make call to spotify
                let response = await skip_api_call();
                if (response.status >= 200 && response.status < 300) {
                    try {
                        // Update delay - new song will actually be first in queue
                        let queue = await get_queue();
                        await say(`Successfully skipped. Now Playing: ${queue[0].name}`)
                    } catch (error) {
                        // If error getting queue
                        await say(`Successfully skipped current track. However, issue occurred getting new track - code ${error.response.status}`)
                    }
                    
                } else {
                    await say(`Error skipping track - code: ${response.status}`)
                }
            }
        } catch (error) {
            if ('response' in error) {
                await say(`Error registering skip - code: ${error.response.status}`)
            }
            console.log(error)
        }


    }
}

module.exports = {
    slack_pause,
    slack_play,
    slack_skip,
    non_slack_play_call
}