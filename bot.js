const { App } = require('@slack/bolt');
const { search_aux } = require('./services/search_services/search.service');
const { format_search } = require('./bot_aux');
const { add_aux } = require('./services/playlist_services/addTrack.service');
const { playlist_tracks } = require('./services/playlist_services/getPlaylist.service');
const { pause_api_call } = require('./services/playback_services/pause.service');
const { play_api_call } = require('./services/playback_services/play.service');
const { find_pos } = require('./services/playlist_services/playlist_utils');
const { skip_api_call } = require('./services/playback_services/skip.service');
const { get_track } = require('./services/playback_services/currentTrack.service');
const { get_queue } = require('./services/playback_services/getQueue.service');
const { sleep } = require('./utils');
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

slackApp.message('search', async ({ message, say }) => {
    /** Search for a song on spotify. If valid search, will return
     * list of 5 options, each with a button to 
     */

    try {
        console.log(message);
        // Only respond if search is the start of the message
        if (message.text.trim() == "search") {
            // Check that there is a query
            await say("Please enter a query after search")
        } else if (message.text.slice(0,7) == "search ") {
            // Extract query and search spotify API
            const query = message.text.slice(7);
            const search_res = await(search_aux(query));
            if ('status' in search_res) {
                await say(`Error - code: ${search_res.status}`);
            } else {
                const res = format_search(search_res, query);    
                await say(res);
                console.log(res);
            }
        }

    } catch (error) {
        console.log(error);
    }
    
})

slackApp.action( "cancel_button" , async ({ body, ack, client, logger }) => {
    // cancel button
    await ack();

    try{
        await client.chat.update({
            "channel": body.channel.id,
            "ts": body.message.ts,
            "blocks": [{
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text":  `Search Cancelled`,
                    "emoji": true
                }
            }]
        })
    } catch (error) {
        console.log(error)
    }
});

slackApp.action( /button./ , async ({ body, ack, client, logger }) => {
    // respond to search buttons


    await ack();
    console.log(body.actions)
    console.log(body.message)

    // get track uri
    const uri = body.actions[0].value

    // try to queue uri, get response
    const response = await add_aux(uri);

    // Update response based on whether song was queued
    if (response >= 200 && response < 300) {
        // 201 means song was queued successfully

        // get selected number
        const selected = body.actions[0].action_id[7];
        const selected_int = Number(selected)

        // extract track name and artist
        const track_name = body.message.blocks[selected_int].fields[0].text.split('\n')[1];
        const track_artists = body.message.blocks[selected_int].fields[1].text.split('\n')[1]
        
        // Update original message to reflect button press
        try{
            await client.chat.update({
                "channel": body.channel.id,
                "ts": body.message.ts,
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "plain_text",
                            "text":  `Queued song: ${track_name}`,
                            "emoji": true
                        }
                    },
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": `Artist(s): ${track_artists}`
                            }
                        ]
                    }
                ]
            })
        } catch (error) {
            logger.error(error);
        }
    } else {
        // Otherwise update message to reflect error code
        try {
            await client.chat.update({
                "channel": body.channel.id,
                "ts": body.message.ts,
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": `Error queueing track - error code: ${response}`,
                            "emoji": true
                        }
                    }
                ]
            })
        } catch (error) {
            console.log(error);
        }
    }
});

slackApp.message('queue', async ({message, say})=> {
    // get current queue if message is exactly "queue" (allowing for spaces on either side)
    if (message.text.trim() === 'queue') {
        res = {
            "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": `Current Queue: `,
                    "emoji": true
                }
            }
            ]
        }

        let queue = await get_queue();
        queue.forEach(track => {
            console.log(track.name)
            res.blocks.push(
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": `${track.name} `
                        }
                    ]
                }
            )
        });

        await say(res);
    }
})

slackApp.message('pause', async ({message, say}) => {
    // pause playback when message is just "pause"
    console.log(message)
    if (message.text.trim() === 'pause') {
        let response = await pause_api_call();
        if (response >= 200 && response < 300) {
            await say("Playback paused");
        } else {
            await say(`Error - code: ${response}`);
        }
    }
})

slackApp.message('play', async ({message, say}) => {
    // resume playback when message is just "play"
    if (message.text.trim() === 'play') {
        let response = await play_api_call();
        if (response >= 200 && response < 300) {
            await say("Playback resumed");
        } else {
            await say(`Error - code: ${response}`);
        }
    }
})

slackApp.message('skip', async ({message, say}) => {
    // Skip current track by sending "skip"

    // Only allow message that is just 'skip' (allowing for spaces)
    if (message.text.trim() === 'skip') {

        // Make spotify API call to skip
        let response = await skip_api_call();

        // check if successfully skipped
        if (response.status >= 200 && response.status < 300) {
            await sleep(700)
            // If so, try get new playing song
            let playing_res = await get_track()
            if (playing_res.status === 200) {
                // return name of song and successful skip
                await say(`Successfully skipped. Now Playing: ${playing_res.data.item.name}`)
            } else {
                // otherwise alert of error
                await say(`Successfully skipped current track. However, issue occurred getting new track - code ${playing_res.status}`)
            }

        } else {
            // otherwise say error code
            await say(`Error - code: ${response.status}`)
        }
    }
})

// Command for testing purposes only
slackApp.message('test', async ({message, say}) => {
    const queue = await get_queue();
    // const tracks = await playlist_tracks();
    // const pos = find_pos("spotify:track:6GCjzkTRSmht3DtU0UtkPd", tracks.items);
    // await say(`position: ${pos}`);
})

module.exports = {slackApp}


