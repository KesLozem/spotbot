const express = require('express');
const router = express.Router();

// Import room.controller.js
const {roomController} = require('../controllers');

// Room routes
router.get('/list', roomController.getRoomsList);
router.get('/create', roomController.createNewRoom);
router.delete('/:pin', roomController.removeRoom);

module.exports = router;
