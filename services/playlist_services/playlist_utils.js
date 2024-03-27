require('dotenv').config;

var playlist_id = process.env.DEFAULT_PLAYLIST_ID;

const setId = (id) => {
    playlist_id = id;
}

const getId = () => {
    return playlist_id;
}

module.exports = {
    setId,
    getId
}