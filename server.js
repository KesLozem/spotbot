const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const routes = require('./routes/index.js');

// socket io 
const { createServer } = require("http"); // SocketIO dependency
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, { 
  serveClient: false,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  } 
});

app.use(express.static(path.join(__dirname + '/public' + '/build')))
   .use(cors())
   .use(cookieParser())
   .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Hello World!'));   
app.use('/api', routes);

httpServer.listen(8080, () => {
    console.log('listening on *:8080');
});

module.exports = {
    app
}

