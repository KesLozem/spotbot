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
    }
    
    return res;
}

module.exports = {
    format_search
}