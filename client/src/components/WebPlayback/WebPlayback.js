import React, { useState, useEffect } from 'react';
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

function WebPlayback({auth_token}) {
    const [player, setPlayer] = useState(undefined);
    
    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'Spotbot 👾',
                getOAuthToken: cb => { cb(auth_token); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                axios.put('/api/playback/device', { device_id: device_id });
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });


            player.connect();

        };
    }, []);

return(
    <p>ADMIN</p>
)
}

export default WebPlayback