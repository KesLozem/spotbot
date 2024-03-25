const { get_queue } = require("../../services/playback_services/getQueue.service");

const slack_queue = async ({message, say})=> {
    // get current queue if message is exactly "queue" (allowing for spaces on either side)
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
    slack_queue
}