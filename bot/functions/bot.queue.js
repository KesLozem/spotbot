const { get_track } = require("../../services/playback_services/currentTrack.service");
const { get_queue } = require("../../services/playback_services/getQueue.service");

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

const slack_queue = async ({message, say})=> {
    // get current queue if message is exactly "!queue" (allowing for spaces on either side)
    if (message.text.trim() === '!queue') {
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
}

module.exports = {
    slack_current,
    slack_queue
}