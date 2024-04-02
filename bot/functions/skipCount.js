var req_skips = 3;
var cur_skips = 0;
var skip_members = [];
var last_voted_track;

const get_req_skips = () => {
    return req_skips;
}

const get_cur_skips = () => {
    return cur_skips;
}

const check_member_vote = (user) => {
    return (skip_members.includes(user))
}

const add_skip_vote = (user) => {
    skip_members.push(user)
    cur_skips++;
}


const check_skip_track = (track) => {
    if (track == last_voted_track) {
        return true;
    } else {
        skip_members = [];
        cur_skips = 0;
        last_voted_track =  track;
    }
}

const set_req_skips = async ({message, say}) => {
    if (/^!setskipvotes [1-9]+[0-9]*$/.test(message.text.trim())) {
        req_skips = message.text.slice(14);
        await say (`Set required votes for skipping to ${req_skips}`)
    }
}


module.exports = {
    get_cur_skips,
    get_req_skips,
    check_member_vote,
    add_skip_vote,
    check_skip_track,
    set_req_skips
}
