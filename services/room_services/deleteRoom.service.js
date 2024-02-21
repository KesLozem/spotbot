const roomsDB = require('../../db/rooms.db');

const deleteRoom = async (pin) => {
    return roomsDB.deleteRoom(pin);
}

module.exports = {
    deleteRoom
};