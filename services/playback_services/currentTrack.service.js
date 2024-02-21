const axios = require('axios');

const track = async (req, res) => {

    try {
        // your application requests authorization
        let access_token = req.query.access_token;
        let authOptions = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

        axios(authOptions)
        .then(function (response) {
            if (response.status === 200) {
                res.send(response.data.item.name);
                console.log(response.data.item.name);
            }         
        })
        .catch(function (error) {
            console.log(error);
        });

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    track
}