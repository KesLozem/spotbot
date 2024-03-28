const { refresh } = require("../../services/auth_services/refresh_token.service");
const { play_api_call } = require("../../services/playback_services/play.service");
const { create_api_call } = require("../../services/playlist_services/create.service");
const { unfollow_playlist } = require("../../services/playlist_services/delete.service");
const { playlist_tracks } = require("../../services/playlist_services/getPlaylist.service");
const { setId } = require("../../services/playlist_services/playlist_utils");
const { remove_api_call } = require("../../services/playlist_services/removeTrack.service");
const { new_first_song } = require("./bot.playback");
require('dotenv').config();

let msg_list = [];

const clear_playlist = async () => {
    try {
        let tracks = await playlist_tracks();
        while (tracks.total > 0) {
            tracks.items.forEach(item => {
                remove_api_call(item.track.uri)
            });
            tracks = await playlist_tracks();
        }
        new_first_song();
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

const slack_reset = async ({message, say, client}) => {
    if (message.text.trim() === "!reset") {
        let response = await cycle_playlist({client});
        if (response.slice(0,5) == "Error") {
            console.log(response)
            await say(response)
        } else {
            await say( `Playlist has been wiped. New Playlist ID : ${response}`)
        }
        try {
            await refresh_call()
        } catch (error) {
            console.log(error)
        }
        
    }
}

const cycle_playlist = async ({client}) => {
    let del_res = await unfollow_playlist()
    if (del_res.status >= 200 && del_res.status < 300) {
        remove_msg_buttons({client})
        let res = await create_api_call()
        if (res.status >= 200 && res.status < 300) {
            let id = res.data.id
            setId(id);
            console.log(`${id}`)
            new_first_song();
            return `${id}`
        } else {
            return "Error creating new playlist"
        }
    } else {
        return "Error unfollowing playlist"
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
    cycle_playlist,
    slack_clear,
    slack_reset,
    remove_msg_buttons,
    store_msg,
    unstore_msg
}