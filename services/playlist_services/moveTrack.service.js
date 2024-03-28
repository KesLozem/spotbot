const axios = require("axios");
const { getAuth } = require("../auth_services/store_auth.service");
const { getId } = require("./playlist_utils");

const shift_api_call = async (pos_from, pos_to) => {
    // Move song from one position to another

    let access_token = getAuth(); // access_token
    let playlist_id = getId(); // default is spotbot playlist

    // spotify API request details
    let authOptions = {
        url: 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks',
        method: 'put',
        headers: { 
            'Authorization': 'Bearer ' + access_token
        },
        data: {
            range_start: pos_from,
            insert_before: pos_to
        },
        json: true
    };

    // log and return spotify response
    return axios(authOptions).then(function (response) {
        if (response.status === 201) {
            // console.log(response.data);
        }
        return response.status
    }).catch( (error) => {
        if ('response' in error) {
            return error.response.status
        } else {
            console.log(error)
        }
    })
    
    
}

module.exports = {
    shift_api_call
}