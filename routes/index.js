//https://www.coreycleary.me/project-structure-for-an-express-rest-api-when-there-is-no-standard-way

const express = require('express');

// Import controllers
const {loginController} = require('../controllers');

const router = express.Router();

// Login routes
router.get('/login', loginController.authUser);
router.get('/callback', loginController.authCallback);
router.get('/refresh_token', loginController.authRefresh);



module.exports = router;