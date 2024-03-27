// Description: Main server file for the application.
const express = require('express');
const app = express();

// Middleware
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { instrument } = require("@socket.io/admin-ui");

// Routes
const authRoutes = require('./routes/auth.js');
const roomRoutes = require('./routes/room_controls.js');
const playbackRoutes = require('./routes/playback.js');
const playlistRoutes = require('./routes/playlist.js');
const searchRoutes = require('./routes/search.js');

// socket io 
const { createServer } = require("http"); // SocketIO dependency
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, { 
  serveClient: false,
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
});

// Socket.io Admin UI - for development purposes
instrument(io, { 
  auth: false,
  mode: "development"
});

// Room_services
const { createRoom } = require('./services/room_services/createRoom.service.js');
const { slackApp, daily_reset } = require('./bot/bot.js');
const { auto_refresh } = require('./services/auth_services/refresh_token.service.js');
require('dotenv').config;


app.use(express.static(path.join(__dirname + '/client' + '/build')))
   .use(cors())
   .use(cookieParser())
   .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Hello World!'));   
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/playback', playbackRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/search', searchRoutes)


httpServer.listen(8080, () => {
    console.log('listening on *:8080');
});

// Connection is made to server from client
io.on('connection', socket => {
  
  // Host connects
  socket.on('host-connect', async () => {
    let roomPin = await createRoom()
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

(async () => {
  // Start your app
  await slackApp.start();

  console.log('⚡️ Bolt app is running!');
})();

auto_refresh();

daily_reset(6);

module.exports = {
    app
}

