const { search_aux } = require('../../services/search_services/search.service');
const { add_aux } = require('../../services/playlist_services/addTrack.service');
const { remove_api_call } = require('../../services/playlist_services/removeTrack.service');


const search_func = async ({ message, say }) => {
    /** Search for a song on spotify. If valid search, will return
     * list of 5 options, each with a button to 
     */

    try {
        console.log(message);
        // Only respond if search is the start of the message
        if (message.text.trim() == "!search") {
            // Check that there is a query
            await say("Please enter a query after search")
        } else if (message.text.slice(0,8) == "!search ") {
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
    
}

const cancel_search = async ({ body, ack, client, logger }) => {
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
}

const search_buttons = async ({ body, ack, client, logger }) => {
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
                    },
                    //Remove song and bring forwards options
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": `Remove`
                                },
                                "value": uri,
                                "style": 'danger',
                                "action_id": `remove`                
                            }, 
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "emoji": true,
                                    "text": `Bring to next`
                                },
                                "value": uri,
                                "style": 'primary',
                                "action_id": `bring_forward`                
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
}

const remove_button = async ({body, ack, client, logger}) => {
    await ack();
    const uri = body.actions[0].value

    const response = await remove_api_call(uri)
    if (response.status >= 200 && response.status < 300) {
        const track_name = body.message.blocks[0].text.text.split(': ')[1];
        try {
            await client.chat.update({
                "channel": body.channel.id,
                "ts": body.message.ts,
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `Removed Track: *${track_name}*`,
                        }
                    }
                ]
            })
        } catch (error) {
            logger.error(error);
        }
    } else {
        console.log(response)
    }

}

const bring_next = async ({body, ack, client, logger}) => {
    await ack();
    const uri = body.actions[0].value
}

const format_search = (tracks, query) => {
    /** Format Results as slack block
     * tracks: list of up to 5 found tracks, each as an object
     * query: query term
     */

    // message always has searching header
    res = {
        "blocks": [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": `Searching for ${query}`,
                "emoji": true
            }
        }
        ]
    }
    
    // buttons for if results present
    buttons = {
        "type": "actions",
        "elements": []
    }

    var acc = 0;
    tracks.forEach(track => {
        // For each track, display name, artist and create button
        acc++;
        res.blocks.push({
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `*Track ${acc}*\n ${track.name}`
                },
                {
                    "type": "mrkdwn",
                    "text": `*Artist(s):*\n ${track.artists}`
                }
            ]
        });

        // create button
        buttons.elements.push({
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": `${acc}`
            },
            "value": track.uri,
            "action_id": `button_${acc}`                
        })
    });
    
    console.log(tracks.length);

    if (tracks.length === 0) {
        // Add text saying no results found if there are no results
        res.blocks.push({
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `No results found.`
                }
            ]
        })
    } else {
        // Otherwise add in the buttons
        res.blocks.push(buttons);
        res.blocks.push({
            "type": "actions",
            "elements": [{
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": `Cancel`
                },
                "style": "danger",
                "value": "cancel",
                "action_id": `cancel_button`                
            }]
        })
    }
    
    return res;
}

module.exports = {
    search_func,
    cancel_search,
    search_buttons,
    remove_button,
    bring_next,
    format_search
}