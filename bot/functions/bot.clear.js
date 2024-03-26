const { track } = require("../../services/playback_services/currentTrack.service");
const { playlist_tracks } = require("../../services/playlist_services/getPlaylist.service");
const { setId } = require("../../services/playlist_services/playlist_utils");
const { remove_api_call } = require("../../services/playlist_services/removeTrack.service");
require('dotenv').config();

let msg_list = [];

const clear_playlist = async () => {
    setId(process.env.DEFAULT_PLAYLIST_ID) // don't clear any other playlist
    try {
        let tracks = await playlist_tracks();
        while (tracks.total > 0) {
            tracks.items.forEach(item => {
                remove_api_call(item.track.uri)
            });
            tracks = await playlist_tracks();
        }
        return "success"
    } catch (error) {
        console.log(error)
        return error
    }
}

const slack_clear = async ({message, say, client}) => {
    if (message.text.trim() === "!clear") {
        let response = await clear_playlist();
        if (response == "success") {
            await say("Playlist Cleared.")
            remove_msg_buttons({client});
        } else {
            let error = response;
            if ('response' in error) {
                await say(`Error - code: ${error.response.status}`)
            } else {
                await say("Error clearing playlist")
            }
        }
    }
}

const remove_msg_buttons = async ({client}) => {
    msg_list.forEach((message) => {
        console.log(message.blocks)
        try {
            blocks = message.message.blocks.slice(0,2)
            client.chat.update({
                "channel": message.channel,
                "ts": message.ts,
                "blocks": blocks
            })
        } catch (error) {
            console.log(error);
        }
    })
}

const store_msg = (data) => {
    msg_list.push(data)
}

const unstore_msg = (timestamp) => {
    let pos = msg_list.findIndex(({ts}) => ts === timestamp);
    msg_list.splice(pos, 1)
}

module.exports = {
    clear_playlist,
    slack_clear,
    remove_msg_buttons,
    store_msg,
    unstore_msg
}