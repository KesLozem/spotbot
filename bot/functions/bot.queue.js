const { get_track } = require("../../services/playback_services/currentTrack.service");
const { get_queue } = require("../../services/playback_services/getQueue.service");
const { pause_api_call } = require("../../services/playback_services/pause.service");
const find_pos = require("../../services/playlist_services/findposition");
const { playlist_tracks } = require("../../services/playlist_services/getPlaylist.service");

var queue_msg;

const slack_current = async ({message, say}) => {
    if (message.text.trim() === "!playing") {
        let response = await get_track()
        if (response.status === 204) {
            await say("No currently playing song")
        } else if (response.status >= 200 && response.status < 300) {

            let track = response.data.item
            let name = track.name
            var artist_list;
            try {
                // Format artists as string in case of multiple artists
                artist_list = track.artists.slice(1).reduce( 
                    (acc, artist) => acc + `, ${artist.name}`,
                    `${track.artists[0].name}` 
                )
            } catch (error) {
                artist_list = 'None';
            }
            await say(`Currently playing *${name}* by *${artist_list}*`)
        } else {
            await say(`Error - code: ${response.status}`);
        }
    }
}

const slack_queue = async ({message, say, client})=> {
    // get current queue if message is exactly "!queue" (allowing for spaces on either side)
    if (message.text.trim() === '!queue') {
        try{
            let current = await get_track();
            if (current.status === 204) {
                await pause_api_call();
                current = await get_track();
            }
            if (current.status >= 200 && current.status < 300 && current.status != 204) {
                let [pos, _] = await find_pos(current.data.item.uri);
                if (pos == -1) {
                    pos = 0;
                }
                let queue = await playlist_tracks(pos, 10);
                if (queue.total === 0) {
                    await say("Queue is currently empty")
                } else {
                    let blocks = format_queue_results(pos, queue.items, queue.total);
                    
                    // delete previous queue message
                    try {
                        await client.chat.delete({
                          channel: queue_msg.channel,
                          ts: queue_msg.ts
                        });
                      }
                      catch (error) {
                        console.error(error);
                      }

                    queue_msg = await say(blocks);
                }                
            } else if (current.status === 204) {
                await say("Queue is currently empty")
            } else {
                await say(`Error getting queue - code: ${current.status}`)
            }
         } catch (error) {
            if ('response' in error) {
                await say(`Error getting queue - code: ${error.response.status}`)
            }
            console.log(error)
        }
        
    }
}

const queue_button = (direction) => async ({body, ack, client, logger}) => {
    await ack();
    let [pos, skips] = body.actions[0].value.split(":")
    try {
        skips = Number(skips) + direction
        pos = Number(pos)
        let queue = await playlist_tracks(pos + 10 * skips, 10);
        if (queue.total <= pos + 10 * skips) {
            // Trying to get next page even though no songs available
            // Likely due to song being removed
            try {
                let blocks = body.message.blocks;
                blocks.pop()
                blocks.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Error - no songs found in target page`,
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
            // Otherwise display new page
            let blocks = format_queue_results(pos, queue.items, queue.total, skips);
            try {
                await client.chat.update({
                    "channel": body.channel.id,
                    "ts": body.message.ts,
                    "blocks": blocks.blocks
                })
            } catch (error) {
                logger.error(error);
            }
        }    
    } catch (error) {
        if ('response' in error) {
            try {
                let blocks = body.message.blocks;
                blocks.pop()
                blocks.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Error Changing Page - code: ${response.status}`,
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
        console.log(error)
    }
}


const format_queue_results = (pos, items, total, skips = 0) => {
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

    var acc = 0
    items.forEach(({track}) => {

            var artist_list;
            try {
                // Format artists as string in case of multiple artists
                artist_list = track.artists.slice(1).reduce( 
                    (acc, artist) => acc + `, ${artist.name}`,
                    `${track.artists[0].name}` 
                )
            } catch (error) {
                artist_list = 'None';
            }

            // extract name, artists and uri
            res.blocks.push({
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": `*${get_prefix(acc + skips * 10)}:* ${track.name}`
                    },
                    {
                        "type": "mrkdwn",
                        "text": `*Artist(s):* ${artist_list}`
                    }
                ]
            })
            acc++;
    })

    var buttons = {
        "type": "actions",
        "elements": []
    }
    var to_add = false;

    if (skips > 0) {
        // create button for previous page
        buttons.elements.push({
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": `:black_left_pointing_double_triangle_with_vertical_bar:`
            },
            "value": `${pos}:${skips}`,
            "action_id": `queue_back`                
        })
        to_add = true
    }
    if (total > (pos + skips * 10 + 10)) {
        // create button for next page
        buttons.elements.push({
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": `:black_right_pointing_double_triangle_with_vertical_bar:`
            },
            "value": `${pos}:${skips}`,
            "action_id": `queue_next`                
        })
        to_add = true
    }

    if (to_add) {
        res.blocks.push(buttons)
    }

    return res
}


const get_prefix = (pos) => {
    if (pos == 0) {
        return "Currently Playing"
    } else {
        return `${pos}`
    }
} 

module.exports = {
    slack_current,
    slack_queue,
    queue_button
}