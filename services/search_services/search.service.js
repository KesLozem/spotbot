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

let search_aux = async ( query, search_type = 'track' ) => {
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
                'type': search_type,
                'limit': NUM_DESIRED_RESULTS
            },
            json: true
        };

        // make API call
        const response = await axios(authOptions);
        
        // return extracted response
        return extract_response(response, search_type);
    } catch (error) {
        if ('response' in error) {
            return error.response;
        }
        console.log(error);
    }
}

const extract_response = (response, search_type) => {
    /** Extract required information from spotify API response */
    if (response.status === 200) {
        // Check correct status

        var items;
        if (search_type == 'track') {
            items = response.data.tracks.items
        } else if (search_type == 'playlist') {
            items = response.data.playlists.items
        }
        
        // console.log(response.data.tracks.total)
        clearResults(); // Clear table in storeResults js

        // create table to store information extracted from each track
        let results = [];
        
        // Extract information from each track separately
        items.forEach( item => {
            var artist_list;
            try {
                // Format artists as string in case of multiple artists
                artist_list = item.artists.slice(1).reduce( 
                    (acc, artist) => acc + `, ${artist.name}`,
                    `${item.artists[0].name}` 
                )
            } catch (error) {
                artist_list = 'None';
            }
            // console.log(`
            // Name: ${item.name}
            // Artist(s): ${artist_list}
            // Spotify URI: ${item.uri}`)
            addResult(item.uri) // add to storeResults table

            // extract name, artists and uri
            results.push({
                name: item.name,
                artists: artist_list,
                uri: item.uri
            })
        });
        return(results)
    }
}

module.exports = {
    search,
    search_aux
}