const { getRooms } = require('../services/room_services/getRooms.service.js');
const { createRoom } = require('../services/room_services/createRoom.service.js');
const { deleteRoom } = require('../services/room_services/deleteRoom.service.js');

// returns a list of all rooms in the Rooms DB
const getRoomsList = async (req, res) => {
    try {
        const rooms = await getRooms();
        res.status(200).send(rooms);
    } catch (error) {
        res.status(500).send(`Error: ${error}`);
        console.log(error);
    }
}

// creates a new room to the Rooms DB and returns the pin
const createNewRoom = async (req, res) => {
    try {
        let pin = await createRoom();
        res.status(200).send(
            {
                "message": `New room created with pin: ${pin}`,
                "pin": pin
            });
    } catch (error) {
        res.status(500).send(`Error: ${error}`);
        console.log(error);
    }
}

// removes room specified with a pin from the Rooms DB
const removeRoom = async (req, res) => {
    try {
        let pin = req.params.pin;
        let result = await deleteRoom(pin);
        if (!result) {
            res.status(404).send(`Room with pin: ${pin} not found`);
        } else {
            res.status(200).send(`Room with pin: ${pin} has been deleted`);
        }
    } catch (error) {
        res.status(500).send(`Error: ${error}`);
        console.log(error);
    }
}

module.exports = {
    getRoomsList,
    createNewRoom,
    removeRoom
}