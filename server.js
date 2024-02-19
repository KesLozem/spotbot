const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { instrument } = require("@socket.io/admin-ui");
const app = express();
const authRoutes = require('./routes/auth.js');
const roomRoutes = require('./routes/room_controls.js');
const playbackRoutes = require('./routes/playback.js');

// socket io 
const { createServer } = require("http"); // SocketIO dependency
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, { 
  serveClient: false,
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  }
});

instrument(io, { 
  auth: false,
  mode: "development"
});

app.use(express.static(path.join(__dirname + '/client' + '/build')))
   .use(cors())
   .use(cookieParser())
   .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Hello World!'));   
app.use('/api/auth', authRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/playback', playbackRoutes);

httpServer.listen(8080, () => {
    console.log('listening on *:8080');
});

// Create a room for the game;
// Rooms will be stored in memory via arrays
const rooms = [];
function createRoom(pin) {
  rooms.push(pin);
}
const generateRoomPin = () => {
    return Math.floor(1000 + Math.random() * 9000);
}
// Connection is made to server from client
io.on('connection', socket => {
  
  // Host connects
  socket.on('host-connect', () => {
    let roomPin = generateRoomPin();
    console.log(`host connected room: ${roomPin}`);
    socket.join(roomPin);
  });

  // Player Joins Room
  socket.on('player-connect', (data) => {
    console.log(`player connected room: ${data}`);
    socket.join(data);
    io.to(data).emit('player-joined', data);
  });

  // Player leaves the game
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

});

module.exports = {
    app
}

