import React from 'react';

function VideoBackground({ videoSource }) {
    return (
        <video
            key={videoSource}
            autoPlay
            loop
            muted
            className="fixed top-0 left-0 w-screen h-screen object-cover"
        >
            <source src={videoSource} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
}

export default VideoBackground;