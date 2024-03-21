import React from "react";
import { useState, useRef, useEffect } from "react";
import "./ClientPlayback.css";

function ClientPlayback({ webPlaybackState, skipTrack }) {
    const [progress, setProgress] = useState(0);
    const [currentTime, setTime] = useState("0:00");
    const [is_paused, setPaused] = useState(true);

    const delay = 1000;

    function calcSongTime(ms) {
        var minutes = Math.floor(ms / 60000);
        var seconds = ((ms % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    useEffect(() => {
        setProgress(webPlaybackState.progress);
        setTime(calcSongTime(webPlaybackState.progress));
        setPaused(webPlaybackState.is_paused);
    }, [webPlaybackState]);

    // Custom hook to handle interval for progress bar
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

    let loading = (
        <div className="loading-container">
            <p>Loading...</p>
        </div>
    )

    let player = (
        <div className="player-container">
            <div className="top">
                <div className="top-content">
                    <div className="top-left">
                        <img className="img-album" src={webPlaybackState.current_track.album.images[0].url} alt="album cover" />
                    </div>
                    <div className="top-right">
                        <div className="artist">{webPlaybackState.current_track.artists[0].name}</div>
                        <div className="title">{webPlaybackState.current_track.name}</div>
                        <div className="buttons">
                            <div onClick={() => skipTrack()}><p className="upnudge"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-skip-end-fill" viewBox="0 0 16 16">
                                <path d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.693 3.3 4 3.678 4 4.308v7.384c0 .63.692 1.01 1.233.697L11.5 8.753V12a.5.5 0 0 0 1 0z" />
                            </svg></p></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bottom">
                <div className="visualiser-container">
                    <div className="music-progress">
                        <div id="progress-bar" className="music-progress-bar" style={{ width: (progress / webPlaybackState.durationms) * 100 + '%' }}></div>
                    </div>
                </div>
                <div className="information-container">
                    <div>{currentTime}</div>
                    <div>{webPlaybackState.duration}</div>
                </div>
            </div>
        </div>
    )

    if (webPlaybackState) {
        return player;
    } else {
        return loading;
    }

}

export default ClientPlayback;