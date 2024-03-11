import React from "react";
import "./SideBar.css";
import { useEffect, useRef, useState } from "react";

function SideBar({ username, allUsers, messages, room, allRooms, createRoom }) {
    const [tabNum, setTabNum] = useState(0);
    let content;

    // define bottom of list
    const bottomRef = useRef(HTMLDivElement>(null));

    // on new message, scroll to bottom
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }
        , [messages]);

    if (tabNum === 0) {
        content = (
            <div className="side">
                <div className="room-name">{room}_logs</div>
                <div className="logs-container">
                    <div className="logs">
                        <ul>
                            {messages.map((message, index) => {
                                return <li key={index}>{`${message.timestamp} ${message.sender}: ${message.message}`}</li>
                            }
                            )}
                        </ul>
                        <div ref={bottomRef}></div>
                    </div>
                </div>

            </div>
        )
    }
    if (tabNum === 1) {
        content = (
            <div className="side">
                <div className="room-name">{room}_users</div>
                <div className="logs-container">
                    <div className="logs">
                        <ul>
                            {allUsers.map((user, index) => {
                                return <li key={index}>{`${user} ${user === username ? "(you)" : ""}`}</li>
                            }
                            )}
                        </ul>
                        <div ref={bottomRef}></div>
                    </div>
                </div>
            </div>
        )
    }
    if (tabNum === 2) {
        content = (
            <div className="side">
                <span className="room-name">select_room</span> 
                <span className="create-btn">
                    <button onClick={createRoom} disabled>CREATE ROOM</button>
                    </span>
                <div className="logs-container">
                    <div className="logs">
                        <ul>
                            {allRooms.map((item, index) => {
                                return <li key={index}>{item} {room === item ? "[Current]" : (<React.Fragment><button di>CONNECT</button></React.Fragment>)}</li>
                            }
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="tabs">
                <button onClick={() => setTabNum(0)}>Chat</button>
                <button onClick={() => setTabNum(1)}>Users</button>
                <button onClick={() => setTabNum(2)}>Rooms</button>
            </div>
            {content}
        </>
    )

}

export default SideBar;