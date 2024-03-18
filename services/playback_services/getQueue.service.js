const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');


const queue = async (req, res) => {
    // Print current queue to console (accessed via URL)

    try {
        await get_queue();
        res.redirect("http://localhost:8080/");    

    } catch (error) {
        console.log(error);
    }
}

const get_queue = async () => {
    
    // Make call to spotify API using relevant information
    let access_token = getAuth();
    let authOptions = {
        url: 'https://api.spotify.com/v1/me/player/queue',
        method: 'get',
        headers: { 
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };


    let response = await axios(authOptions)

    // extract and return track
    console.log(response.data.queue)
    return response.data.queue

}

module.exports = {
    queue,
    get_queue
}