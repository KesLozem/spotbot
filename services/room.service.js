const io = require('socket.io')(server);
const generateRandomString = require('../utils');

// function to generate 4 digit random room pin
const generateRoomPin = () => {
    return Math.floor(1000 + Math.random() * 9000);
}

// store room codes and list of ids in a map
const roomMap = new Map();

// Create a new room
io.on('connection', socket => {
    socket.on('create-room', room => {
        socket.join(room);
        if (roomMap.has(room)) {
            roomMap.get(room).push(socket.id);
        } else {
            roomMap.set(room, [socket.id]);
        }
        socket.emit('joined room', generateRandomString(16));
    });
});