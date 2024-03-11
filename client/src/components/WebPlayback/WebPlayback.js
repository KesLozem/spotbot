import React, { useState, useEffect, useRef } from 'react';
import './WebPlayback.css';
import axios from 'axios';

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

function calcSongTime(ms) {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function WebPlayback() {
return(
    <p>ADMIN</p>
)
}

export default WebPlayback