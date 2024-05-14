const { state_api_call } = require("../../services/playback_services/getState.service");
const { switch_states, playlist_states } = require("../../services/playlist_services/playlist.chooser");
const { setFallbackId } = require("../../services/playlist_services/playlist_utils");
const { search_aux } = require("../../services/search_services/search.service");
const { non_slack_play_call } = require("./bot.playback");
const { validate_button_clicker } = require("./bot.search");

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

const fallback_search = async ({ message, say }) => {
    /** Search for a palylist on spotify. If valid search, will return
     * list of 5 options, each with a button to select
     */

    try {
        // Only respond if setfallback is the start of the message
        if (message.text.trim() == "!setfallback") {
            // Check that there is a query
            await say("Please enter a query after search")
        } else if (message.text.slice(0,13) == "!setfallback ") {
            // Extract query and search spotify API
            const query = message.text.slice(13);
            // get user
            const user = message.user
            const search_res = await(search_aux(query, 'playlist'));
            if ('status' in search_res) {
                await say(`Error - code: ${search_res.status}`);
            } else {
                const res = format_playlist_search(search_res, query, user);    
                await say(res);
            }
        }

    } catch (error) {
        console.log(error);
    }
    
}

const format_playlist_search = (playlists, query, user) => {
    /** Format Results as slack block
     * playlists: list of up to 5 found playlists, each as an object
     * query: query term
     */

    // message always has searching header
    res = {
        "blocks": [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": `Searching for playlist ${query}`,
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
    playlists.forEach(playlist => {
        // For each playlist, display name, artist and create button
        acc++;
        res.blocks.push({
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `*Playlist ${acc}*\n ${playlist.name}`
                },
                {
                    "type": "mrkdwn",
                    "text": `*Artist(s):*\n ${playlist.artists}`
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
            "value": `${playlist.uri};${user}`,
            "action_id": `playlist_${acc}`                
        })
    });
    

    if (playlists.length === 0) {
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

const playlist_buttons = async ({ body, ack, client, logger }) => {
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

    // Set fallback uri
    console.log(uri);
    let id = uri.split(':')[2]
    setFallbackId(id);

    // get selected number
    const selected = body.actions[0].action_id[9];
    const selected_int = Number(selected)

    // extract playlist name and artists
    const playlist_name = body.message.blocks[selected_int].fields[0].text.split('\n')[1];

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
                        "text":  `Fallback playlist changed to ${playlist_name}`,
                        "emoji": true
                    }
                }
            ]
        })
    } catch (error) {
        logger.error(error);
    }
   
}

module.exports = {
    slack_switch,
    fallback_search,
    playlist_buttons
}