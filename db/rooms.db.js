let rooms = []

function createRoom(pin) {
  rooms.push(pin);
}

const generateRoomPin = () => {
    return Math.floor(1000 + Math.random() * 9000);
}

const getRooms = () => {
    return rooms;
}

module.exports = {
    createRoom,
    generateRoomPin,
    getRooms
}