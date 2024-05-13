const { get_track } = require("../playback_services/currentTrack.service");
const { pause_api_call } = require("../playback_services/pause.service");
const find_pos = require("./findposition");
const { playlist_tracks } = require("./getPlaylist.service");
const { getFallbackId, getId } = require("./playlist_utils");

var change_to_fallback = true;
var empty_queue = true;
var change_to_queue = false;
var fallback_pos = 0;
var queue_pos = 0;
const playlist_states = {
    queue: 'queue',
    fallback: 'fallback'
}

var cur_state = playlist_states.fallback;

const clear_playlist_vars = () => {
    empty_queue = true;
    change_to_fallback = true;
    change_to_queue = false;
    queue_pos = 0;
}

const get_playlist_change = async () => {

    let playlist_id = getId();
    let fallback_id = getFallbackId();
    if (change_to_queue) {
        // If current state is awaiting switch to queue playlist, store current position in fallback playlist and return appropriate values

        // Get current position in fallback playlist
        let current = await get_track();
        if (current.status === 204) {
            await pause_api_call();
            current = await get_track();
        }
        let pos = 0;
        if (current.status >= 200 && current.status < 300 && current.status != 204) {
            [pos, _] = await find_pos(current.data.item.uri, null, fallback_id);
            if (pos == -1) {
                pos = 0;
            }
        }
        //store value
        fallback_pos = pos;

        return [playlist_states.queue, queue_pos]
    } else if (change_to_fallback) {
        // If awaiting change to fallback, store position in queue playlist and return appropriate values

        if (empty_queue) {
            queue_pos = 0;
        } else {
            // Get current position in queue playlist
            let current = await get_track();
            if (current.status === 204) {
                await pause_api_call();
                current = await get_track();
            }
            let pos = 0;
            if (current.status >= 200 && current.status < 300 && current.status != 204) {
                [pos, _] = await find_pos(current.data.item.uri);
                if (pos == -1) {
                    pos = 0;
                }
            }
            queue_pos = pos;
        }

        return [playlist_states.fallback, fallback_pos]

    } else {
        return [null, null]
    }
}

const switch_states = () => {
    if (cur_state === playlist_states.fallback) {
        if (empty_queue) {
            return "invalid";
        }
        cur_state = playlist_states.queue;
        change_to_queue = true;
        change_to_fallback = false;
        return playlist_states.queue
    } else if (cur_state === playlist_states.queue) {
        cur_state = playlist_states.fallback
        change_to_fallback = true;
        change_to_queue = false;
        return playlist_states.fallback;
    }
}

const queue_test = () => {
    if (empty_queue) {
        empty_queue = false;
        change_to_queue = true;
        change_to_fallback = false;
        return true;
    }
    return false;    
}

const queue_played = () => {
    change_to_queue = false;
    cur_state = playlist_states.queue;
}

const fallback_played = () => {
    change_to_fallback = false;
    cur_state = playlist_states.fallback;
}

const daily_fallback_reset = async () => {
    fallback_id = getFallbackId();
    let data = await playlist_tracks(0,50,fallback_id)
    fallback_pos = Math.floor(Math.random() * data.total)
}


module.exports = {
    playlist_states,
    queue_played,
    fallback_played,
    clear_playlist_vars,
    get_playlist_change,
    switch_states,
    queue_test,
    daily_fallback_reset
}