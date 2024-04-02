require('dotenv').config;

var playlist_id = process.env.TEST_PLAYLIST_ID;

var change_to_fallback = true;
var empty_queue = true;
var change_to_queue = false;
var fallback_current_pos = 0;

const setId = (id) => {
    playlist_id = id;
}

const getId = () => {
    return playlist_id;
}

const set_fallback_change = (bool) => {
    change_to_fallback = bool;
}

const set_queue_empty = (bool) => {
    empty_queue = bool;
}

const set_queue_change = (bool) => {
    change_to_queue = bool;
}

const set_fallback_pos = (pos) => {
    fallback_current_pos = pos;
}

const get_fallback_change = () => {
    return change_to_fallback;
}

const get_queue_empty = () => {
    return empty_queue;
}

const get_queue_change = () => {
    return change_to_queue;
}

const get_fallback_pos = () => {
    return fallback_current_pos;
}

module.exports = {
    setId,
    getId,
    set_fallback_change,
    set_queue_change,
    set_queue_empty,
    get_fallback_change,
    get_queue_change,
    get_queue_empty,
    set_fallback_pos,
    get_fallback_pos
}