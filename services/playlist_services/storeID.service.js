var playlist_id;

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