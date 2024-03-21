require('dotenv').config;

var playlist_id = process.env.DEFAULT_PLAYLIST_ID;
let user = '';

const setUserId = (id) => {
    user = id;
}

const getUserId = () => {
    return user;
}

const setId = (id) => {
    playlist_id = id;
}

const getId = () => {
    return playlist_id;
}

const find_pos = (track_uri, items_list) => {
    return items_list.findIndex(({track}) => track.uri === track_uri) + 1;
}

module.exports = {
    setId,
    getId,
    find_pos,
    setUserId,
    getUserId
}