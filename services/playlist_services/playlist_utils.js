require('dotenv').config;

var playlist_id = null;
var fallback_id = process.env.FALLBACK_PLAYLIST_ID;



const setId = (id) => {
    playlist_id = id;
}

const getId = () => {
    return playlist_id;
}

const setFallbackId = (id) => {
    fallback_id = id
}

const getFallbackId = () => {
    return fallback_id
}
module.exports = {
    setId,
    getId,
    setFallbackId,
    getFallbackId
}