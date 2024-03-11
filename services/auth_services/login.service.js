const generateRandomString = require('../../utils/').generateRandomString;
const querystring = require('querystring');

const client_id = process.env.CLIENT_ID; // Your client id
const redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */

let stateKey = 'spotify_auth_state';

const login = async (req, res) => {

    try {
        // your application requests authorization
        const state = generateRandomString(16);
        res.cookie(stateKey, state);
        const scope = 'user-read-private user-read-currently-playing user-modify-playback-state streaming'
        + ' user-read-playback-state playlist-read-private playlist-modify-private playlist-modify-public';
        res.redirect('https://accounts.spotify.com/authorize?' +
            querystring.stringify({
                response_type: 'code',
                client_id: client_id,
                scope: scope,
                redirect_uri: redirect_uri,
                state: state
            }));
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    login
}