const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');
const { clearResults, addResult } = require('./storeResults.service');
const NUM_DESIRED_RESULTS = 5;


const search = async (req, res) => {
    /** Search function from express URL
     */

    try {
        let query = req.query.q; //extract query from url

        try {
            // fix spaces if necessary
            query = query.replace(/ /g || '+', '%20');
        } catch (error) {console.log(error)}

        await search_aux(query); // pass api call to spotify using extracted query

        res.redirect("http://localhost:8080/");

    } catch (error) {
        console.log(error);
    }
}

let search_aux = async ( query ) => {
    /** Call spotify API */

    try{

        let access_token = getAuth();

        //payload for spotify API call
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

        // make API call
        const response = await axios(authOptions);
        
        // return extracted response
        return await extract_response(response);
    } catch (error) {
        console.log(error);
    }
}

const extract_response = (response) => {
    /** Extract required information from spotify API response */
    if (response.status === 200) {
    // Check correct status
        tracks = response.data.tracks
        console.log(response.data.tracks.total)
        clearResults(); // Clear table in storeResults js

        // create table to store information extracted from each track
        let results = [];
        
        // Extract information from each track separately
        tracks.items.forEach( track => {
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
            console.log(`
            Name: ${track.name}
            Artist(s): ${artist_list}
            Spotify URI: ${track.uri}`)
            addResult(track.uri) // add to storeResults table

            // extract name, artists and uri
            results.push({
                name: track.name,
                artists: artist_list,
                uri: track.uri
            })
        });
        return(results)
    }
}

module.exports = {
    search,
    search_aux
}