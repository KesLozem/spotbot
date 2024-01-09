const {login} = require('../services/login_services/login.service');
const {callback} = require('../services/login_services/callback.service');
const {refresh} = require('../services/login_services/refresh_token.service')

const authUser = (req, res) => {
    try {
        login(req, res);
    } catch (error) {
        console.log(error);
    }
}

const authCallback = (req, res) => {
    try {
        console.log('authCallback');
        callback(req, res);
    } catch (error) {
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
