const roomsDB = require('../../db/rooms.db');

const createRoom = async () => {
    let pin = roomsDB.generateRoomPin();
    roomsDB.createRoom(pin);
    return pin;
}

module.exports = {
    createRoom
};