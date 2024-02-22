const paylists = new Map();

// convert items array to object
function enrichTracks(items) {
    // returns array of objects
    return items.map(item => {
        return {
            "track_id": item,
            "upvote": 0,
            "skips": 0
        }
    })
}

// check duplicate tracks
function checkDuplicate(user_id, track_id) {
    let userSession = paylists.get(user_id);
    let items = userSession.get("items");
    return items.some(item => item.track_id === track_id);
}

function getPlaylist(user_id) {
    return paylists.get(user_id);
}

function getTracks(user_id) {
    return paylists.get(user_id).get("items");
}

// Ensure playlist exists first
function populatePlaylist(user_id, playlist_id, items) {
    let userSessions = new Map()

    let tracks = enrichTracks(items);

    // Define user session object
    userSessions.set("playlist_id", playlist_id);
    userSessions.set("items", tracks);
    paylists.set("user_id", user_id);   //add to playlist obj
}

function clearPlaylist(user_id) {
    let userSession = paylists.get(user_id);
    userSession.set("items", []);
    paylists.set(user_id, userSession);
}

function addSong(user_id, track_id) {
    if (checkDuplicate(user_id, track_id)) {
        return "Track already exists in playlist";
    }
    track = {
        "track_id": track_id,
        "upvote": 0,
        "skips": 0
    };
    let userSession = paylists.get(user_id);
    let items = userSession.get("items");
    items.push(track);
    userSession.set("items", items);
    paylists.set(user_id, userSession);
}

function removeSong(user_id, track_id) {
    let userSession = paylists.get(user_id);
    let items = userSession.get("items");
    items = items.filter(item => item.track_id !== track_id);
    userSession.set("items", items);
    paylists.set(user_id, userSession);
}

function upvoteSong(user_id, track_id) {
    let userSession = paylists.get(user_id);
    let items = userSession.get("items");
    let track = items.find(item => item.track_id === track_id);
    track.upvote += 1;
    sortPlaylist(user_id);
    paylists.set(user_id, userSession);
}

function skipSong(user_id, track_id) {
    let userSession = paylists.get(user_id);
    let items = userSession.get("items");
    let track = items.find(item => item.track_id === track_id);
    track.skips += 1;
    if (track.skips >= 3) {
        removeSong(user_id, track_id);
    }
    paylists.set(user_id, userSession);
}

function sortPlaylist(user_id) {
    let userSession = paylists.get(user_id);
    let items = userSession.get("items");
    items.sort((a, b) => {
        return b.upvote - a.upvote;
    });
    userSession.set("items", items);
    paylists.set(user_id, userSession);
}

module.exports = {
    populatePlaylist,
    clearPlaylist,
    addSong,
    removeSong,
    upvoteSong,
    skipSong,
    getPlaylist,
    getTracks
}