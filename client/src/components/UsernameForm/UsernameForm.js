import React from "react";
import "./UsernameForm.css";

const { useState } = React;

function UsernameForm({ handleUsernameChange, handleConnect }) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => setIsModalVisible(true);
    const hideModal = () => setIsModalVisible(false);

    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            handleConnect();
        }
    }

    return (
        <div>
            <button className="show-modal" onClick={showModal}>
                Enter Username
            </button>

            {isModalVisible && (
            <div className="mask-modal">
                <div className="modal">
                    <div><h2>Enter Username</h2></div>
                    <div className="user-input">
                        <span><input 
                                className="username-input" 
                                type="text" 
                                placeholder="Username..."
                                onChange={handleUsernameChange}
                                onKeyDown={handleKeyPress}
                            />
                        </span>
                        <span><button className="username-submit" onClick={handleConnect}>Submit</button></span>
                    </div>
                    <button className="close-modal" onClick={hideModal}>
                    X
                </button>
                </div>
            </div>
            )}
        </div>
    )
}

export default UsernameForm;