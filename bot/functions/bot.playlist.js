const { state_api_call } = require("../../services/playback_services/getState.service");
const { switch_states, playlist_states } = require("../../services/playlist_services/playlist.chooser");
const { non_slack_play_call } = require("./bot.playback");

const slack_switch = async ({message, say}) => {
    // pause playback when message is just "pause"
    if (message.text.trim() === '!switch') {
        let new_state = switch_states();
        if (new_state === playlist_states.fallback) {
            await say("Switched to fallback playlist")
        } else if (new_state === playlist_states.queue) {
            await say("Switched to today's queue playlist")
        } else {
            await say("Cannot switch playlist - today's queue is empty. Search for a song to automatically switch")
            return;
        }

        let response = await state_api_call();
        if (response.status === 200 && response.data.is_playing) {
            await non_slack_play_call();
        }
    }
}

module.exports = {
    slack_switch,
}