const { App } = require('@slack/bolt');
const { search_aux } = require('./services/search_services/search.service');
const { format_search } = require('./bot_aux');
const { query } = require('express');
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
            await say(res)
            
        }

    } catch (error) {
        console.log(error);
    }
    
})

slackApp.action( /button./ , async ({ body, ack, client, logger }) => {
    await ack();
    // respond to search buttons
    console.log(body.actions)
    console.log(body.message)

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
});

slackApp.command('/skip', async ({command, ack, say}) => {
    await ack();
    console.log(command)
    await say(`${command}`);
});

slackApp.command('/search', async ({command, ack, say}) => {
    await ack();
    console.log(command)
    await say(`${command}`);
});

module.exports = {slackApp}


