import React from "react";
import "./Home.css";
import SideBar from "../SideBar/SideBar";

function Home({
    username,
    allUsers,
    messages,
    message,
    handleMessageChange,
    sendMessage,
    joinRoom,
    allRooms,
    room,
    socketID,
    createRoom,
    handleUsernameChange,
}) {
    return (
        <div className="container">
            <div className="player">
                AJJSJS
            </div>
            <div className="sidebar">                
                <SideBar 
                    username={username}
                    allUsers={allUsers}
                    messages={messages}
                    allRooms={allRooms}
                    room={room}
                    createRoom={createRoom}
                    handleUsernameChange={handleUsernameChange}
                />
            </div>
            <div className="queue"></div>
        </div>
    )       
}

export default Home;
