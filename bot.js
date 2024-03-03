const { App } = require('@slack/bolt');
require('dotenv').config();


// Initializes your app in socket mode with your app token and signing secret
const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true, // add this
    appToken: process.env.SLACK_APP_TOKEN // add this
  });

slackApp.message('hello', async ({ message, say }) => {

    // say() sends a message to the channel where the event was triggered
    await say(`Hey there <@${message.user}>!`);
});

slackApp.message('search', async ({ message, say }) => {
    console.log(message);
    if (message.text.trim() == "search") {
        await say("Please enter a query after search")
    } else if (message.text.slice(0,7) == "search ") {
        await say({
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": `Searching for ${message.text.slice(7)}`,
                        "emoji": true
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*Result number*\n 1"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Name*\n Some name"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Artist(s):*\n Some artist(s)"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*Result number*\n 2"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Name*\n Some name"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Artist(s):*\n Some artist(s)"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*Result number*\n 3"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Name*\n Some name"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Artist(s):*\n Some artist(s)"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*Result number*\n 4"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Name*\n Some name"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Artist(s):*\n Some artist(s)"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*Result number*\n 5"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Name*\n Some name"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "*Artist(s):*\n Some artist(s)"
                        }
                    ]
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "1"
                            },
                            "value": "click_me_123",
                            "action_id": "option_1"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "2"
                            },
                            "value": "click_me_123",
                            "action_id": "option_2"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "3"
                            },
                            "value": "click_me_123",
                            "action_id": "option_3"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "4"
                            },
                            "value": "click_me_123",
                            "action_id": "option_4"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "5"
                            },
                            "value": "click_me_123",
                            "action_id": "option_5"
                        }
                    ]
                }
            ]
        })
    }
    
})

slackApp.action( /option_./ , async ({ body, ack, client, logger }) => {
    await ack();
    // Update the message to reflect the action
    console.log(body.actions)
    console.log(body.message)
    const selected = body.actions[0].action_id[7];
    try{
        const res = await client.chat.update({
            "channel": body.channel.id,
            "ts": body.message.ts,
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "Song Queued",
                        "emoji": true
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*Selected Option:* " + selected
                        },

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


