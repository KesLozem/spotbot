const { App } = require('@slack/bolt');
const { search_aux } = require('./services/search_services/search.service');
const { format_search } = require('./bot_aux');
const { query } = require('express');
const { add_aux } = require('./services/playlist_services/addTrack.service');
const { get_tracks } = require('./services/playlist_services/getPlaylist.service');
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
            const res = format_search(search_res, query);    
            await say(res);
            console.log(res);
            
        }

    } catch (error) {
        console.log(error);
    }
    
})

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
    if (response === 201) {
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

    let tracks = await get_tracks();
    tracks.items.forEach(track => {
        console.log(track.track.name)
        res.blocks.push(
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": `${track.track.name} `
                    }
                ]
            }
        )
    });

    console.log(res);
    await say(res);



})



module.exports = {slackApp}


