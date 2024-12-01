import React, { useEffect, useRef, useState } from "react";

const TIME_DELAY_MS = 1000;

const API_ENDPOINT = "http://127.0.0.1:5000";
function VideoRecorder() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [emotion, setEmotion] = useState(null);
    const [score, setScore] = useState(null);
    const intervalRef = useRef(null);

    const captureSnapshot = async () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const context = canvas.getContext("2d");
        // Set canvas dimensions to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current video frame onto the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get the image data as a Blob or base64 (choose based on API requirements)
        const dataUrl = canvas.toDataURL("image/jpeg");
        const response = await fetch(dataUrl);
        const blob = await response.blob(); // Use blob for API call

        // Send API request
        const formData = new FormData();
        formData.append("image", blob);
        try {
            const apiResponse = await fetch(`${API_ENDPOINT}/getEmotionFromImage`, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json", // Ensure the server understands you're expecting JSON
                },
            });
            const result = await apiResponse.json();
            const score = result.score;
            const emotion = result.emotion;
            setScore(score);
            setEmotion(emotion);
        } catch (error) {
            console.error("Error fetching emotion:", error);
        }
    };

    useEffect(() => {
        // Access user's webcam
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        startCamera();

        intervalRef.current = setInterval(captureSnapshot, TIME_DELAY_MS);

        return () => {
            // Cleanup on component unmount
            clearInterval(intervalRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
            }
        };
    }, []);

    return (
        <div style={{ textAlign: "center" }}>
            <h1>Video Confusion Score</h1>
            <div style={{ display: "inline-block", position: "relative" }}>
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    style={{
                        border: "1px solid black",
                        width: "60%",
                        backgroundColor: "black",
                    }}
                ></video>
                <div
                    style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "5px",
                    }}
                >
                    {emotion && <div>Emotion: {emotion}</div>}
                    {score && <div>Score: {score}</div>}
                </div>
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
        </div>
    );
};

export default VideoRecorder;