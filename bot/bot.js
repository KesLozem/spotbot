const { App } = require('@slack/bolt');
const { search_func, cancel_search, search_buttons, remove_button, bring_next } = require('./functions/bot.search');

const { find_pos, setId } = require('../services/playlist_services/playlist_utils');
const { get_track } = require('../services/playback_services/currentTrack.service');
const { get_queue } = require('../services/playback_services/getQueue.service');
const { sleep } = require('../utils');
const { state_api_call } = require('../services/playback_services/getState.service');
const { setDeviceId } = require('../services/playback_services/device.store');
const { slack_pause, slack_play, slack_skip } = require('./functions/bot.playback');
const { slack_queue } = require('./functions/bot.queue');
require('dotenv').config();


// Initializes your app in socket mode with your app token and signing secret
const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
  });

slackApp.message('hello', async ({ message, say }) => {


    await say(`Hey there <@${message.user}>!`);
});


// !search and relevant buttons
slackApp.message('!search', search_func);
slackApp.action( "cancel_button", cancel_search);
slackApp.action( /button./, search_buttons);
slackApp.action("remove", remove_button);
slackApp.action("bring_forward", bring_next);

slackApp.message('!queue', slack_queue);

slackApp.message('!pause', slack_pause);

slackApp.message('!play', slack_play);

slackApp.message('!skip', slack_skip);

// Command for testing purposes only
slackApp.message('test', async ({message, say}) => {
    const msg = await say("test");
    console.log(msg)
})

slackApp.message('!id', async ({message, say}) => {
    let res = await state_api_call();
    console.log(res)
    setDeviceId(res.data.device.id);
    await say(res.data.device.id);
})

module.exports = {slackApp}


