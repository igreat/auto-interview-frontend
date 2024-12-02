import { useState, useRef, useEffect } from "react";
import { AudioManager } from "./utils/audioManager";
import { transcribeAudio, generateSpeech, getChatResponse } from "./utils/chatAPI";
import { Leva } from "leva";
import { Canvas } from "@react-three/fiber";
import Experience from "./components/Experience";

const API_ENDPOINT = "http://127.0.0.1:5000";
const TIME_DELAY_MS = 1000;

function LiveChatbot({ jobDescription, CV }) {
    const [transcription, setTranscription] = useState("");
    const [chatResponse, setChatResponse] = useState("");
    const [recording, setRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false); // Track speaking state
    const [showPopup, setShowPopup] = useState(true); // Popup visibility state
    const audioManagerRef = useRef(null);
    const [emotionList, setEmotionList] = useState([]); // last 10 seconds of emotions

    const audioRef = useRef(null);
    const [lipsync, setLipsync] = useState(null);

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
            console.log("Emotion:", emotion);
            console.log("Score:", score);
            // limit it to the last 10 seconds, aka 5 frames
            if (emotion) {
                setEmotionList((prev) => {
                    if (prev.length === 10) {
                        prev.shift();
                    }
                    return [...prev, { emotion, score }];
                });
            }
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

    // this is triggered when too much confusion is detected from user
    const triggerConfusionResponse = async () => {
        // this just checks if last 5 emotions are confusion-ish
        // anything other than happy or neutral is considered confusion
        // const isConfused = emotionList.length === 5 &&
        //     emotionList.every(
        //         (emotion) => emotion.emotion !== "happy" && emotion.emotion !== "neutral"
        //     );
        // if last 5 has 3 or more confusion, then we consider it as confusion
        const isConfused = emotionList.length === 10 &&
            emotionList.filter((emotion) => emotion.emotion !== "happy" && emotion.emotion !== "neutral").length >= 8;

        // if (isConfused) {
        //     // send a message to the chatbot
        //     await handleChatbotResponse("User is seemingly confused, ask them if they need help");
        //     setEmotionList([]); // clear the list
        // }
    };

    // useEffect(() => {
    //     triggerConfusionResponse();
    // }
    //     , [emotionList]);

    const handleChatbotResponse = async (userInput, context) => {
        if (!userInput) return;
        try {
            // Send user text to the backend
            // const response = await fetch(`${API_ENDPOINT}/processUserText`, {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ user_text: userInput }),
            // });

            // just make it a simple call to the openai api
            // concatenate the previous chat response with the user input
            const previousChat = chatResponse ? chatResponse : "";
            const input = `CONVERSATION:\n${previousChat}\nUSER:\n${userInput}:`;

            const data = await getChatResponse(input, context);
            // const data = await response.json();
            if (data.choices && data.choices.length) {
                // Decode Base64 WAV file
                // const wavFileBase64 = data.wav_file;
                // const wavBlob = new Blob([Uint8Array.from(atob(wavFileBase64), c => c.charCodeAt(0))], {
                //     type: "audio/mp3",
                // });

                // // Play the WAV file
                // const wavUrl = URL.createObjectURL(wavBlob);
                // const lipsync = data.command_output;
                // audioRef.current.play(); // Play the audio immediately
                // make the openai call here to convert the text to speech
                const wavUrl = await generateSpeech(data.choices[0].message.content);
                // const lipsync = data.command_output;

                setChatResponse(data.choices[0].message.content);
                // setLipsync(lipsync);

                const audio = new Audio(wavUrl);
                audio.play(); // Play the audio immediately
                // audioRef.current = audio; // Assign the new Audio object to ref
                console.log("GPT Response:", data.choices[0].message.content);
                console.log("Command Output:", data.command_output);
            } else {
                console.error("Error:", data.error);
            }
        } catch (error) {
            console.error("Error processing user input:", error);
        }
    };

    const handleStopRecording = async (audioBlob) => {
        try {
            const transcriptionData = await transcribeAudio(audioBlob);
            const newTranscription = `${transcription} ${transcriptionData.text}`;
            setTranscription(newTranscription);

            if (transcriptionData.text.trim()) {
                await handleChatbotResponse(newTranscription);
            }

            // Automatically restart recording
            startRecording();
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleSpeakingStateChange = (speaking) => {
        setIsSpeaking(speaking);
        console.log(speaking ? "Speaking..." : "Silent...");
    };

    const handlePopupConfirm = async () => {
        setShowPopup(false);
        startRecording();
        // make an initial call to the chatbot asking it to start the interview
        await handleChatbotResponse("could you please say the following verbatim: Hi, you have applied for the role of Software engineer, let dive straight into your interview. From your CV I can see that you have some experience with making URL shortening services, this is also an important part of the role you have applied for. So if you had to make such a service, and it took a long URL and converted it into a shorter, unique URL, how would you approach it?", "Hi Adi, you have applied for the role of Software engineer, let dive straight into your interview. From your CV I can see that you have some experience with making URL shortening services, this is also an important part of the role you have applied for. So if you had to make such a service, and it took a long URL and converted it into a shorter, unique URL, how would you approach it?");
    };

    const startRecording = () => {
        setRecording(true);
        if (!audioManagerRef.current) {
            audioManagerRef.current = new AudioManager(
                handleStopRecording,
                handleSpeakingStateChange,
                5000,
                25,
                25,
            );
        }
        audioManagerRef.current.startRecording();
    };

    return (
        <div className="relative w-full h-screen bg-black">
            {showPopup && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-4">Are you ready to start the interview?</h2>
                        <button
                            onClick={handlePopupConfirm}
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                        >
                            Yes, Start
                        </button>
                    </div>
                </div>
            )}
            {/* Constrained Avatar Frame */}
            <div
                className="absolute top-4 left-4 right-4 bottom-4 mx-auto border border-gray-300 rounded-md shadow-lg bg-black mt-6"
                style={{
                    maxWidth: "85%",
                    maxHeight: "80%",
                }}
            >
                <Canvas
                    className="w-full h-full"
                    shadows
                    camera={{ position: [10, 0, 8], fov: 30 }}
                >
                    <Experience />
                </Canvas>
            </div>

            {/* Your Camera Feed */}
            {/* center */}
            <div className="items-center">
                <div
                    className="absolute bottom-20 right-4 w-60 h-44 border border-gray-300 rounded-md overflow-hidden bg-black"
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    ></video>
                    <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                </div>

                {/* Emotion Display */}
                <div
                    className="absolute bottom-6 right-16 bg-black bg-opacity-75 text-white text-sm text-center py-2 px-3 rounded-md"
                    style={{
                        minWidth: "8rem", // Ensures enough width for the text
                    }}
                >
                    {emotion && score ? (
                        <div>
                            <strong>Emotion:</strong> {emotion} <br />
                            <strong>Score:</strong> {score.toFixed(2)}
                        </div>
                    ) : (
                        <div>Detecting...</div>
                    )}
                </div>
            </div>
            {/* Transcriptions at the Bottom */}
            <div
                className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-center py-4"
            >
                <div>
                    {isSpeaking ? "Listening..." : "Silent..."}
                </div>
                {/* <div> */}
                    {/* {chatResponse || ""}
                </div> */}
            </div>
        </div>
    );
}

export default LiveChatbot;
