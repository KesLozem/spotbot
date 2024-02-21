import React from "react";  
import io from "socket.io-client";

const socket = io();

socket.on('connect', () => {
    console.log('connected');
    socket.emit('host-connect');
});

function CreateRoom() {
    return (
        <div>
            <h1>Create Room</h1>
            <button><a href="/api/auth/login">HELLO</a></button>
            <button><a href="/api/auth/refresh_token">NEW TOKEN</a></button>
            <button><a href="/api/playback/pause">PAUSE</a></button>
            <button><a href="/api/playback/play">PLAY</a></button>
            <button><a href="/api/playback/state">PLAYBACK STATUS</a></button>
            <button><a href="/api/playback/track">CURRENT TRACK</a></button>
        </div>
    )
}

export default CreateRoom;