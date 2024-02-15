//https://www.coreycleary.me/project-structure-for-an-express-rest-api-when-there-is-no-standard-way

const express = require('express');
const router = express.Router();

// Import controllers
const {authController} = require('../controllers');

// Login routes
router.get('/login', authController.authUser);
router.get('/callback', authController.authCallback)
router.get('/refresh_token', authController.authRefresh);

module.exports = router;