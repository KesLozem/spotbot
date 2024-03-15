import React from "react";
import "./Home.css";
import SideBar from "../SideBar/SideBar";
import WebPlayback from "../WebPlayback/WebPlayback";
import ClientPlayback from "../ClientPlayback/ClientPlayback";

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
    isAdmin,
    auth_token,
    sendWebPlaybackState,
    webPlaybackState
}) {
    return (
        <div className="container">
            <div className="player">

                {isAdmin ? 
                <WebPlayback 
                    auth_token={auth_token}
                    sendWebPlaybackState={sendWebPlaybackState}
                /> : <ClientPlayback 
                    webPlaybackState={webPlaybackState}
                />}
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
            <div className="queue">
                QUEUE
            </div>
        </div>
    )       
}

export default Home;
