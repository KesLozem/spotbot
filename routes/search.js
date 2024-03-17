const express = require('express');
const router = express.Router();

// Import controllers
const {searchController} = require('../controllers');

// Login routes
router.get('/', searchController.searchFor);

module.exports = router;