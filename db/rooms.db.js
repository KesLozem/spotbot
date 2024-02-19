let rooms = [];

function generateRoomPin() {
    let pin = Math.floor(1000 + Math.random() * 9000);
    while (rooms.includes(pin)) {
        pin = Math.floor(1000 + Math.random() * 9000);
    }
    return pin;
}

function createRoom(pin) {
    rooms.push(pin);
}

function getRooms() {
    return rooms;
}

function deleteRoom(pin) {
    if (rooms.includes(pin)) {
        rooms = rooms.filter(room => room !== pin);
        return true;   
    } else {return false;}
}

module.exports = {
    createRoom,
    generateRoomPin,
    getRooms,
    deleteRoom
}