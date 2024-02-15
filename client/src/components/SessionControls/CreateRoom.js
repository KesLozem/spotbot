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
        </div>
    )
}

export default CreateRoom;