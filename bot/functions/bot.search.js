const { search_aux } = require('../../services/search_services/search.service');
const { add_aux } = require('../../services/playlist_services/addTrack.service');
const { remove_api_call } = require('../../services/playlist_services/removeTrack.service');
const { store_msg, unstore_msg } = require('./bot.clear');
const find_pos = require('../../services/playlist_services/findposition');
const { get_track } = require('../../services/playback_services/currentTrack.service');
const { pause_api_call } = require('../../services/playback_services/pause.service');
const { shift_api_call } = require('../../services/playlist_services/moveTrack.service');
const { sleep } = require('../../utils');
const { get_queue_empty, set_queue_change, set_queue_empty, set_fallback_change } = require('../../services/playlist_services/playlist_utils');
const { state_api_call } = require('../../services/playback_services/getState.service');
const { non_slack_play_call } = require('./bot.playback');
const { queue_test } = require('../../services/playlist_services/playlist.chooser');

let button_ffa = false;

const search_func = async ({ message, say }) => {
    /** Search for a song on spotify. If valid search, will return
     * list of 5 options, each with a button to 
     */

    try {
        // Only respond if search is the start of the message
        if (message.text.trim() == "!search") {
            // Check that there is a query
            await say("Please enter a query after search")
        } else if (message.text.slice(0,8) == "!search ") {
            // Extract query and search spotify API
            const query = message.text.slice(8);
            // get user
            const user = message.user
            const search_res = await(search_aux(query));
            if ('status' in search_res) {
                await say(`Error - code: ${search_res.status}`);
            } else {
                const res = format_search(search_res, query, user);    
                await say(res);
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
        let search_user = body.actions[0].value;
        let click_user = body.user.id;
        let allowed = await validate_button_clicker(click_user, search_user, client, body)
        if (!allowed) {
            return;
        }
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

    console.log(body.actions[0])


    // Extract relevant information
    const b_val = body.actions[0].value
    // Original Search User
    const search_user = b_val.split(';')[1]
    // Button clicker
    const click_user = body.user.id;
    // track uri
    const uri = b_val.split(';')[0]

    // Ensure button click is allowed
    let allowed = await validate_button_clicker(click_user, search_user, client, body);
    if (!allowed) {
        return;
    }

    // try to queue uri, get response
    const response = await add_aux(uri);

    // Update response based on whether song was queued
    if (response >= 200 && response < 300) {
        // 201 means song was queued successfully

        // Handle playlist switching if added to empty queue
        if (queue_test()) {

            // If currently playing, make call to switch playlist
            let response = await state_api_call();
            if (response.status === 200 && response.data.is_playing) {
                await non_slack_play_call();
            }
        }

        // get selected number
        const selected = body.actions[0].action_id[7];
        const selected_int = Number(selected)

        // extract track name and artist
        const track_name = body.message.blocks[selected_int].fields[0].text.split('\n')[1];
        const track_artists = body.message.blocks[selected_int].fields[1].text.split('\n')[1]
        
        // Update original message to reflect button press
        try{
            let res = await client.chat.update({
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
                                "value": b_val,
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
                                "value": b_val,
                                "style": 'primary',
                                "action_id": `bring_forward`                
                            }
                        ]
                    }
                ]
            })
            store_msg(res);
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
    
    // Extract relevant information
    const b_val = body.actions[0].value
    // Original Search User
    const search_user = b_val.split(';')[1]
    // Button clicker
    const click_user = body.user.id;
    // track uri
    const uri = b_val.split(';')[0]

    // Ensure button click is allowed
    let allowed = await validate_button_clicker(click_user, search_user, client, body);
    if (!allowed) {
        return;
    }

    // remove track from playlist
    const response = await remove_api_call(uri)
    if (response.status >= 200 && response.status < 300) {
        // If successful, update message to reflect track removal
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
            unstore_msg(body.message.ts)
        } catch (error) {
            logger.error(error);
        }
    } else {
        try {
            //Otherwise append error to message
            let blocks = body.message.blocks;
            blocks.push({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Error Removing Track - code: ${response.status}`,
                }
            })
            await client.chat.update({
                "channel": body.channel.id,
                "ts": body.message.ts,
                "blocks": blocks
            })
        } catch (error) {
            logger.error(error);
        }
    }

}

const bring_next = async ({body, ack, client, logger}) => {
    await ack();

    // Extract relevant information
    const b_val = body.actions[0].value
    // Original Search User
    const search_user = b_val.split(';')[1]
    // Button clicker
    const click_user = body.user.id;
    // track uri
    const uri = b_val.split(';')[0]

    // Ensure button click is allowed
    let allowed = await validate_button_clicker(click_user, search_user, client, body);
    if (!allowed) {
        return;
    }

    let [track_pos, track_list] = await find_pos(uri)
    if (track_pos == -1) {
        // If not in playlist, update message to reflect that song was removed
        try {
            let blocks = body.message.blocks.slice(0,2);
            blocks.push({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Error - Song removed from playlist`,
                }
            })
            await client.chat.update({
                "channel": body.channel.id,
                "ts": body.message.ts,
                "blocks": blocks
            })
        } catch (error) {
            logger.error(error);
        }
    } else {
        try {
            let res = await get_track();
            if (res.status === 204) {
                await pause_api_call();
                res = await get_track();
            }
            let [pos, _] = await find_pos(res.data.item.uri, track_list);

            let response = await shift_api_call(track_pos, pos + 1);
            if (response >= 200 && response < 300) {
                try {
                    let blocks = body.message.blocks.slice(0,2);
                    blocks.push({
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `Successfully moved to next playlist position`,
                        }
                    })
                    await client.chat.update({
                        "channel": body.channel.id,
                        "ts": body.message.ts,
                        "blocks": blocks
                    })
                } catch (error) {
                    logger.error(error);
                }
            }


        } catch (error) {
            console.log(error)
        }
    }
}

const toggle_ffa = async ({message, say}) => {
    if (message.text.trim() == '!togglebuttonlock') {
        if (button_ffa) {
            button_ffa = false;
            await say("Interacting with others' searches has been disabled")
        } else {
            button_ffa = true;
            await say(`<@${message.user}> has enabled interacting with other people's searches!`)
        }
    }
}

const validate_button_clicker = async (action_user, original_user, client, body) => {
    // Check if button clicker is original person who searched for song
    if (button_ffa) {
        return true
    } else if (action_user == original_user) {
        return true
    } else {
        try {
            // If not, update message to reflect this
            let blocks = body.message.blocks;
            blocks.push({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `<@${action_user}> tried to interact with <@${original_user}>'s search`,
                }
            })
            await client.chat.update({
                "channel": body.channel.id,
                "ts": body.message.ts,
                "blocks": blocks
            })
            return false;
        } catch (error) {
            console.log(error);
        }
    }
}

const format_search = (tracks, query, user) => {
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
            "value": `${track.uri};${user}`,
            "action_id": `button_${acc}`                
        })
    });
    

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
                "value": user,
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
    format_search,
    toggle_ffa,
    validate_button_clicker
}