import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import io from 'socket.io-client';
import Home from './components/Home/Home.js';

import EnterUsername from './components/UsernameForm/UsernameForm.js';

function App() {
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [allRooms, setAllRooms] = useState(['general']);
  const [room, setRoom] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const socketRef = useRef();
  const [auth_token, setAuth_token] = useState('');
  const [userCount, setUserCount] = useState(0);

  // Webplayback State
  const WebPlayback = {
    is_paused: false,
    is_active: false,
    isLoading: true,
    current_track: {
      name: "",
      album: {
        images: [
          { url: "" }
        ]
      },
      artists: [
        { name: "" }
      ]
    },
    progress: 0,
    durationms: 0,
    duration: "00:00",
    currentTime: "00:00"
  }
  const [webPlaybackState, setWebPlaybackState] = useState(WebPlayback);

  useEffect(() => {
    setMessage('');
  }, [messages]);

  // useEffect(() => {
  //   console.log(allRooms);
  // }, [allRooms]);

  // run connection string on mount
  useEffect(() => {
    socketRef.current = io.connect('/');
    setConnected(true);
    socketRef.current.emit('check-host', (res) => {
      console.log(res);
      if (res.users === 0) {
        setAdminId(res.adminId);
        setIsAdmin(true);
      }
      if (res.auth_token !== null) {
        setAuth_token(res.auth_token);
        //TODO: Logic for auth token for a specific room:
        //      allow connect to namespace '/' then ask for login
        //      upon joining a room. Each room has different token.
      }
    });
  }, []);

  function handleConnect() {
    console.log(`connecting as ${username}`)
    setSubmitted(true);

    socketRef.current.emit('join-server', username);
        
    socketRef.current.emit('join-room', username, 'general', (messages) => {
      setRoom('general');
      setMessages(messages);
    });

    socketRef.current.on('user-joined', users => {
      setAllUsers(users);
    });

    socketRef.current.emit('send-message', {message: `${username} has joined the party!`, sender: 'SPOTBOT', room: 'general'} );

    socketRef.current.on('message', ( message ) => {
      setMessages(message);
    });

    socketRef.current.on('new-webPlaybackState', (state) => {
      console.log("RECEIVED_PLAYBACK_STATE", state);
    });

    socketRef.current.on('user-left', (users, message) => {
      setAllUsers(users);
      setMessages(messages => [...messages, message]);
      });
  }

  function sendMessage() {
    socketRef.current.emit('send-message', { message, username, room });
    setMessage('');
  }

  function handleUsernameChange(e) {
    setUsername(e.target.value);
  }

  function handleMessageChange(e) {
    setMessage(e.target.value);
  }

  function joinRoom(roomName) {
    socketRef.current.emit('join-room', username, roomName, (messages) => {
      setMessages(messages);
      setRoom(roomName);
    });
  }

  function sendWebPlaybackState(state) {
    socketRef.current.emit('webPlaybackState', state, room);
    console.log("CURRENT_PLAYBACK_STATE", state)
  }

  function createRoom() {
    
    // socketRef.current.emit('host-connect');
    // socketRef.current.emit('join-room', username, 'wiooly', (messages) => {
    //   setMessages(messages);
    //   setRoom('wiooly');
    // });
  }

  let content = (<p>HELLO</p>);
  if (connected){
    if (auth_token === null || auth_token === ''){
      content = (
        <a href='/api/auth/login'>
          <button>Login</button>
        </a>
      );
    } else if (!submitted) {
      content = (
        <EnterUsername username={username} handleUsernameChange={handleUsernameChange} handleConnect={handleConnect} />
      );
    } else {
      content = (
        <div className='App'>
        <Router>
          <Routes>
            <Route path="/" element={
              <Home 
                username={username}
                allUsers={allUsers}
                messages={messages}
                message={message}
                handleMessageChange={handleMessageChange}
                sendMessage={sendMessage}
                joinRoom={joinRoom}
                allRooms={allRooms}
                room={room}
                socketID={socketRef.current.id}
                createRoom={createRoom}
                handleUsernameChange={handleUsernameChange}
                isAdmin={isAdmin}
                auth_token={auth_token}
                sendWebPlaybackState={sendWebPlaybackState}
              />
            } />
          </Routes>
        </Router>
      </div>
      );
    }
  }


  return (content);
}

export default App;
