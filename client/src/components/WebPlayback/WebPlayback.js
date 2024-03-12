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

function WebPlayback({ auth_token }) {

    const [player, setPlayer] = useState(undefined);
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);  
    const [current_track, setTrack] = useState(track);
    const [progress, setProgress] = useState(0);
    const [durationms, setDurationms] = useState(0);
    const [delay, setDelay] = useState(1000);
    const [duration, setDuration] = useState("00:00");
    const [currentTime, setTime] = useState("00:00");

    useInterval(() => {
        setProgress(progress => progress + 1000);
        setTime(calcSongTime(progress));
    }, !is_paused ? delay : null);

    function useInterval(callback, delay) {
        const savedCallback = useRef();
        
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        useEffect(() => {
            function tick() {
                savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
    }

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

            // event listeners
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                axios.put('/api/playback/device', { device_id: device_id });
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            // track change and updated events listener
            player.addListener('player_state_changed', (state => {

                if (!state) {
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);
                setDuration(calcSongTime(state.duration));
                setTime(calcSongTime(state.position));
                setProgress(parseInt(state.position));
                setDurationms(state.duration);


                player.getCurrentState().then(state => {
                    (!state) ? setActive(false) : setActive(true);
                    setIsLoading(false);
                });

            }));


            player.connect();

        };
    }, []);

    let webplayback = (
        <>
            <div className="webplayback-container">
                <div className="main-wrapper">
                    <img src={current_track.album.images[0].url}
                        className="now-playing__cover" alt="" />

                    <div className="now-playing__side">
                        <div className="now-playing__name">{
                            current_track.name
                        }</div>

                        <div className="now-playing__artist">{
                            current_track.artists[0].name
                        }</div>
                        <div class="music-progress">
                            <div id="progress-bar" class="music-progress-bar" style={{width: (progress/durationms) * 100 + '%'}}></div>
                            <div class="music-progress__time">
                                <span class="music-progress__time-item music-current-time">{currentTime}</span>
                                <span class="music-progress__time-item music-duration-time">{duration}</span>
                            </div>
                        </div>
                        <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                            ⏮
                        </button>

                        <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                            {is_paused ? "⏵" : "⏸"}
                        </button>

                        <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                            ⏭
                        </button>
                    </div>
                </div>
            </div>
        </>
    )

    let loading = (
        <div className="loading-container">
            <p>Loading...</p>
        </div>
    )

    let notActive = (
        <>
            <div className="container">
                <div className="main-wrapper">
                    <b style={{color: "white"}}> Instance not active. Transfer your playback using your Spotify app </b>
                </div>
            </div>
        </>)

    // rendering logic
    if (isLoading) {
        return loading;
    }
    if (!is_active) {
        return notActive;
    } else {
        return webplayback;
    }
}

export default WebPlayback