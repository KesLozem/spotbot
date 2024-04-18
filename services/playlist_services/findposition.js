const { sleep } = require("../../utils");
const { playlist_tracks } = require("./getPlaylist.service");

const find_pos = async (track_uri, track_list = null, playlist_uri = null) => {
    
    // don't make call if track list supplied   
    if (track_list != null) {
        let pos = track_list.findIndex(({track}) => track.uri === track_uri)
        return [pos, track_list]
    }

    let data = await playlist_tracks(0, 50, playlist_uri);
    item_list = data.items
    let total = data.total
    let cur = 0
    let pos = -1

    while (cur < total) {
        pos = data.items.findIndex(({track}) => track.uri === track_uri);
        if (pos >= 0) {
            pos += cur
            break;
        } else {
            cur += 50
            if (cur < total) {
                data = await playlist_tracks(cur, 50, playlist_uri);
                item_list = item_list.concat(data.items)
            }
            
        }
    }
    return [pos, track_list]
}

module.exports = find_pos