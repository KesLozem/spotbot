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

function WebPlayback({ auth_token, sendWebPlaybackState }) {

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
    const [state, setState] = useState({
        context: {
            uri: '', // The URI of the context (can be null)
            metadata: {},             // Additional metadata for the context (can be null)
        },
        disallows: {                // A simplified set of restriction controls for
            pausing: false,           // The current track. By default, these fields
            peeking_next: false,      // will either be set to false or undefined, which
            peeking_prev: false,      // indicates that the particular operation is
            resuming: false,          // allowed. When the field is set to `true`, this
            seeking: false,           // means that the operation is not permitted. For
            skipping_next: false,     // example, `skipping_next`, `skipping_prev` and
            skipping_prev: false      // `seeking` will be set to `true` when playing an
            // ad track.
        },
        paused: false,  // Whether the current track is paused.
        position: 0,    // The position_ms of the current track.
        repeat_mode: 0, // The repeat mode. No repeat mode is 0,
        // repeat context is 1 and repeat track is 2.
        shuffle: false, // True if shuffled, false otherwise.
        track_window: {
            current_track: {
                album: {
                    uri: "spotify:track:xxxx", // Spotify URI
                    id: "xxxx",                // Spotify ID from URI (can be null)
                    type: "track",             // Content type: can be "track", "episode" or "ad"
                    media_type: "audio",       // Type of file: can be "audio" or "video"
                    name: "Song Name",         // Name of content
                    is_playable: true,         // Flag indicating whether it can be played
                    images: [{ url: "" }],
                    artists: [
                        { uri: 'spotify:artist:xxxx', name: "Artist Name" }
                    ]
                },
                artists: [{ name: "Artist Name" }],
            },                              // The track currently on local playback
            previous_tracks: [{}], // Previously played tracks. Number can vary.
            next_tracks: [{}]      // Tracks queued next. Number can vary.
        }
    });

    useEffect(() => {
        setTrack(state.track_window.current_track);
        setPaused(state.paused);
        setDuration(calcSongTime(state.duration));
        setTime(calcSongTime(state.position));
        setProgress(parseInt(state.position));
        setDurationms(state.duration);
        sendWebPlaybackState({
            is_paused: state.paused,
            is_active: is_active,
            isLoading: isLoading,
            current_track: {
                name: state.track_window.current_track.name,
                album: {
                    images: [
                        { url: state.track_window.current_track.album.images[0].url }
                    ]
                },
                artists: [
                    { name: state.track_window.current_track.artists[0].name }
                ]
            },
            progress: progress,
            durationms: state.duration,
            duration: duration,
            currentTime: currentTime
        });
        // console.log("STATE_OBJ", state);
    }, [state]);


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

                setState(state);

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
                        <div className="music-progress">
                            <div id="progress-bar" className="music-progress-bar" style={{ width: (progress / durationms) * 100 + '%' }}></div>
                            <div className="music-progress__time">
                                <span className="music-progress__time-item music-current-time">{currentTime}</span>
                                <span className="music-progress__time-item music-duration-time">{duration}</span>
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
                    <b style={{ color: "white" }}> Instance not active. Transfer your playback using your Spotify app </b>
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