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

// Utils
const utils = require('./utils/');
const { getAuth, setAuth } = require('./services/auth_services/store_auth.service');

// socket io 
const { createServer, get } = require("http"); // SocketIO dependency
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  serveClient: false,
  cors: {
    origin: ["http://localhost:8080/", "https://admin.socket.io"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
});

// Socket.io Admin UI - for development purposes
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
app.use('/api/rooms', roomRoutes);
app.use('/api/playback', playbackRoutes);

httpServer.listen(8080, () => {
  console.log('listening on *:8080');
});

//messages to be playlist and stored in db
let users = [];
let listeners = [];
let messages = [];
messages['general'] = [];

// Connection is made to server from client
io.on('connection', socket => {

  socket.on('check-host', (cb) => {
    cb({users: users.length, auth_token: getAuth(), adminId: socket.id});
  });

  // User joins server
  socket.on("join-server", (username) => {
    const user = {
      username: username,
      id: socket.id,
      current_room: ''
    };
    if (getAuth()) {  
          users.push(user);
          io.emit("new-user", users);
    }
  });

  // Host connects
  socket.on('host-connect', async () => {
    // let roomPin = await createRoom();
    // console.log(`host created room: ${roomPin}`);    
    // // return roomPin
    // // create new messages
    // messages[roomPin] = [];
    // listeners[roomPin] = [];
    // console.log('created dbs')
    // io.emit('new-room', roomPin);
  });

  // User joins room
  socket.on('join-room', (username, roomName, cb) => {
    socket.join(roomName);
    
    // change current room association
    let userIndex = users.findIndex(user => user.id === socket.id)
    users[userIndex].current_room = roomName;

    cb(messages[roomName]);
    if (listeners[roomName]) {
      listeners[roomName].push(username);
    } else {
      listeners[roomName] = [username];
    }
    io.to(roomName).emit('user-joined', listeners[roomName]);
    io.to(roomName).emit('send-message', { message: `${username} has joined the party!`, sender: 'SPOTBOT', room: roomName });
  });

  // Emit message
  socket.on('send-message', ({ message, sender, room }) => {
    console.log(`${utils.getCurrentDateTime()} [${room}] ${sender}: ${message}`)
    const payload = {
      message: message,
      sender: sender,
      room: room,
      timestamp: utils.getCurrentDateTime()
    };
    if (messages[room]) {
      messages[room].push(payload);
    } else {
      messages[room] = [payload];
    }
    io.to(room).emit('message', messages[room]);
  });
  
  // Host leaves room
  socket.on('host-leave-room', (roomName) => {
    // console.log(`host left room: ${roomName}`);
    // io.to(roomName).emit('host-left');
    // //kick everyone out of room
    // io.of('/').in(roomName).clients((error, socketIds) => {
    //   if (error) throw error;
    //   socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(roomName));
    // });
  });

  // User leaves room
  socket.on('leave-room', (username, roomName) => {
    console.log(`user left room: ${roomName}`);
    socket.leave(roomName);
    listeners[roomName] = listeners[roomName].filter(listener => listener !== username);
    io.to(roomName).emit('user-left', listeners[roomName]);
    io.to(roomName).emit('send-message', {message: `${username} has left the party!`, sender: 'SPOTBOT', room: 'general'} );
  });

  // User leaves server
  socket.once('disconnect', () => {

    let disc_id = socket.id
    let userIndex = users.findIndex(user => user.id === disc_id);
    let username = users[userIndex].username;
    let roomName = users[userIndex].current_room;
    let message = {
      message: `${username} has left the party!`,
      sender: 'SPOTBOT',
      room: roomName,
      timestamp: utils.getCurrentDateTime()
    };

    // filter and update users and listeners
    listeners[roomName] = listeners[roomName].filter(listener => listener !== username);
    // if first user leaves then disconnect everone
    console.log("userIndex", userIndex) // comes up as 1 for some reason
    console.log("users", users)
    if (userIndex === 0) {
      io.sockets.sockets.forEach(socket => {
        socket.disconnect(true);
      });
      setAuth(null);
      console.log('auth', getAuth());
      console.log('list of sockets', io.sockets.sockets)
      console.log('ADMIN LEFT')
    }
    users = users.filter(user => user.id !== socket.id);
    
    // update front end with user leaving
    io.of('/').to(roomName).emit('user-left', listeners[roomName], message);
    
    // update state of room messages
    messages[roomName].push(message);
    console.log(`${utils.getCurrentDateTime()} [${roomName}] ${message.sender}: ${message.message}`)
  });

});

module.exports = {
  app
}

