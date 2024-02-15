const {login} = require('../services/auth_services/login.service');
const {callback} = require('../services/auth_services/callback.service');
const {refresh} = require('../services/auth_services/refresh_token.service')
const {storeAuth} = require('../services/auth_services/store_auth.service');
const {auth_list} = require('../services/auth_services/store_auth.service');

const authUser = (req, res) => {
    try {
        login(req, res);
    } catch (error) {
        console.log(error);
    }
}

// Auth token returned from Spotify in the res object
const authCallback = async (req, res) => {
    try {
        const userTokens = await callback(req, res);
        storeAuth(userTokens, res);
        console.log(auth_list);
    } catch (error) {
        res.status(500).send(`Error: ${error}`);
        console.log(error);
    }
}

const authRefresh = (req, res) => {
    try {
        refresh(req, res);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    authUser,
    authCallback,
    authRefresh
}
