const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const NUM_DESIRED_RESULTS = 5;


const search = async (req, res) => {

    try {
        // your application requests authorization
        let access_token = getAuth();
        let query = req.query.q;

        try {
            query = query.replace(/ /g || '+', '%20');
          } catch (error) {console.log(error)}

        let authOptions = {
            url: 'https://api.spotify.com/v1/search',
            method: 'get',
            headers: { 
                'Authorization': 'Bearer ' + access_token
            },
            params: {
                'q': query,
                'type': 'track',
                'limit': NUM_DESIRED_RESULTS
            },
            json: true
        };

        axios(authOptions)
        .then(function (response) {
        if (response.status === 200) {
            tracks = response.data.tracks
            console.log(response.data);
            tracks.items.forEach( track => {
                const artists = track.artists.slice(1).reduce( 
                    (acc, artist) => acc + `, ${artist.name}`,
                    `${track.artists[0].name}`
                )
                console.log(`
                Name: ${track.name}
                Artist(s): ${artists}
                Spotify URI: ${track.uri}`)
            });
            res.redirect("http://localhost:8080/");
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
    search
}