const { App } = require('@slack/bolt');
const { search_func, cancel_search, search_buttons, remove_button, bring_next, toggle_ffa } = require('./functions/bot.search');

const { wait_until } = require('../utils');
const { state_api_call } = require('../services/playback_services/getState.service');
const { setDeviceId } = require('../services/playback_services/device.store');
const { slack_pause, slack_play, slack_skip } = require('./functions/bot.playback');
const { slack_queue, slack_current, queue_button } = require('./functions/bot.queue');
const { slack_clear, remove_msg_buttons, cycle_playlist, slack_reset } = require('./functions/bot.clear');
const slack_commands = require('./functions/bot.commands');
const { set_req_skips } = require('./functions/skipCount');
const { refresh_call } = require('../services/auth_services/refresh_token.service');
const { setAuth } = require('../services/auth_services/store_auth.service');
const { setFallbackId } = require('../services/playlist_services/playlist_utils');
const { set_fallback_pos, daily_fallback_reset } = require('../services/playlist_services/playlist.chooser');
const { slack_switch, fallback_search, playlist_buttons } = require('./functions/bot.playlist');
require('dotenv').config();


// Initializes your app in socket mode with your app token and signing secret
const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
  });


// !search and relevant buttons
slackApp.message('!search', search_func);
slackApp.action( "cancel_button", cancel_search);
slackApp.action( /button./, search_buttons);
slackApp.action("remove", remove_button);
slackApp.action("bring_forward", bring_next);

slackApp.message('!playing', slack_current);
slackApp.message('!queue', slack_queue);
slackApp.action('queue_back', queue_button(-1))
slackApp.action('queue_next', queue_button(1))

slackApp.message('!pause', slack_pause);

slackApp.message('!play', slack_play);

slackApp.message('!skip', slack_skip);

slackApp.message('!clear', slack_clear);

slackApp.message('!reset', slack_reset);

slackApp.message('!commands', slack_commands);

slackApp.message('!togglebuttonlock', toggle_ffa);

slackApp.message('!switch', slack_switch);

slackApp.message('!setfallback', fallback_search);
slackApp.action(/playlist./, playlist_buttons);

slackApp.message(/!setskipvotes [1-9]*/, set_req_skips);


// // Command for testing purposes only
// slackApp.message('test', async ({message, say, client}) => {
//     if (message.text.trim() === "test") {
//         const msg = await say("test");
//         await daily_fallback_reset();
//         console.log(message)
//         console.log(msg)
//         // remove_msg_buttons({client})
//     }
// })

slackApp.message('!id', async ({message, say}) => {
    if (message.text.trim() == '!id') {
        let res = await state_api_call();
        // console.log(res)
        setDeviceId(res.data.device.id);
        await say(res.data.device.id);
    }
})

slackApp.message('!token', async ({message}) => {
    if (message.text.trim() == '!token') {
        let response = await refresh_call();
        if (response.status === 200) {
            let access_token = response.data.access_token;
            setAuth(access_token)
            console.log({
            'access_token': access_token
            });
        }
    }
})

const daily_reset = async (hour) => {
    try {
        await wait_until(hour);
        await cycle_playlist({client: slackApp.client})
        setFallbackId(process.env.FALLBACK_PLAYLIST_ID)
        await daily_fallback_reset();
        await sleep(5)
        daily_reset(hour)
    } catch (error) {
        console.log(error)
    }
    
}

module.exports = {
    slackApp,
    daily_reset
}


