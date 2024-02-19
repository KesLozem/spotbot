const roomsDB = require('../../db/rooms.db');

const getRooms = async () => {
    const rooms = roomsDB.getRooms();
    return rooms;
}

module.exports = {
    getRooms
};
