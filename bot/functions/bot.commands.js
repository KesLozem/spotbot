const slack_commands = async ({message, say}) => {
    if (message.text.slice(0,9) === '!commands') {
        blocks = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "Playback Commands",
                        "emoji": true
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*!search* <query>"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "Search spotify for query and choose from top 5 results"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*!play*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "Start/Resume playback"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*!pause*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "Pause playback"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*!playing*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "Get currently playing track"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*!queue*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "Get the current queue"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*!skip*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "vote to skip the currently playing track"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*!clear*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "Remove all songs added to queue and change back to fallback playlist (DOperatePlaylist)"
                        }
                    ]
                },
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "Dev",
                        "emoji": true
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*!togglebuttonlock*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "Toggle verification when search buttons are clicked - allow/disallow users to interact with others' searches"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*!id*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "Set playback device ID - use when device ID has changed (i.e. on webplayer page refresh)"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*!reset*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "Purge and reset playlist (for use when spotify stops automatic queue updates)"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*!setskipvotes <value>*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "Update minimum votes required to skip to <value> (must be integer >= 1)"
                        }
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": "*!token*"
                        },
                        {
                            "type": "mrkdwn",
                            "text": "Refresh spotify API access token"
                        }
                    ]
                }
            ]

        if (message.text.trim() == '!commands') {
            msg = {
                "blocks": blocks.slice(0,8)
            }
            await say(msg)
        } else if (message.text.trim() == '!commands -dev') {
            msg = {
                "blocks": blocks.slice(8)
            }
            await say(msg)
        } else if (message.text.trim() == '!commands -all') {
            msg = {
                "blocks": blocks
            }
            await say(msg)
        }
    }
}

module.exports = slack_commands