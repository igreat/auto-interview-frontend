import { useState, useRef, useEffect } from "react";
import { AudioManager } from "./utils/audioManager";
import { transcribeAudio, getChatResponse, generateSpeech } from "./utils/chatAPI";
import { Loader } from "@react-three/drei";
import { Leva } from "leva";
import { Canvas } from "@react-three/fiber";
import Experience from "./components/Experience";

const API_ENDPOINT = "http://127.0.0.1:5000";

function LiveChatbot() {
    const [transcription, setTranscription] = useState("");
    const [chatResponse, setChatResponse] = useState("");
    const [recording, setRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false); // Track speaking state
    const audioManagerRef = useRef(null);

    const audioRef = useRef(null);
    const [lipsync, setLipsync] = useState(null);
    const [playAudio, setPlayAudio] = useState(false);

    // const handleChatbotResponse = async (userInput) => {
    //     try {
    //         // Fetch Chatbot Response
    //         const chatData = await getChatResponse(userInput); // Replace with actual GPT API call
    //         const responseText = chatData.choices[0].message.content;
    //         setChatResponse(responseText);

    //         // Generate and Speak the Response
    //         const audioUrl = await generateSpeech(responseText);

    //         const audio = new Audio(audioUrl);
    //         audio.play(); // Speak the response immediately
    //     } catch (error) {
    //         console.error("Error during TTS generation:", error);
    //         alert("An error occurred while generating speech.");
    //     }
    // };

    const handleChatbotResponse = async (userInput) => {
        try {
            // Send user text to the backend
            const response = await fetch(`${API_ENDPOINT}/processUserText`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_text: userInput }),
            });

            const data = await response.json();
            if (response.ok) {
                // Decode Base64 WAV file
                const wavFileBase64 = data.wav_file;
                const wavBlob = new Blob([Uint8Array.from(atob(wavFileBase64), c => c.charCodeAt(0))], {
                    type: "audio/wav",
                });

                // Play the WAV file
                const wavUrl = URL.createObjectURL(wavBlob);
                const lipsync = data.command_output;
                // audioRef.current.play(); // Play the audio immediately
                
                setChatResponse(data.gpt_text);
                setLipsync(lipsync);
                setPlayAudio(true);
                
                const audio = new Audio(wavUrl);
                audioRef.current = audio; // Assign the new Audio object to ref
                console.log("GPT Response:", data.gpt_text);
                console.log("Command Output:", data.command_output);
            } else {
                console.error("Error:", data.error);
            }
        } catch (error) {
            console.error("Error processing user input:", error);
        }
    };

    useEffect(() => {
        if (audioRef.current && playAudio && audioRef.current.ended) {
            setPlayAudio(false);
        }
    }, [playAudio]);

    const handleStopRecording = async (audioBlob) => {
        try {
            const transcriptionData = await transcribeAudio(audioBlob);
            setTranscription((prev) => `${prev} ${transcriptionData.text}`);

            // Pass transcription to handleChatbotResponse
            await handleChatbotResponse(transcriptionData.text);

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

    const startRecording = () => {
        setRecording(true);
        if (!audioManagerRef.current) {
            audioManagerRef.current = new AudioManager(
                handleStopRecording,
                handleSpeakingStateChange,
                2000,
                20,
                20,
            );
        }
        audioManagerRef.current.startRecording();
    };

    const stopRecording = () => {
        setRecording(false);
        audioManagerRef.current?.stopRecording();
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <Leva />
            <Canvas shadows camera={{ position: [10, 0, 8], fov: 30 }}>
                <Experience audioRef={audioRef} lipsync={lipsync} />
            </Canvas>
            <h1 className="text-2xl font-bold text-center mb-6">Live Chatbot</h1>

            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-2">Live Transcription:</h3>
                <p className="text-gray-700">{transcription}</p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-2">Chatbot Response:</h3>
                <p className="text-gray-700">{chatResponse}</p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-2">Speaking State:</h3>
                <p className="text-gray-700">{isSpeaking ? "Speaking..." : "Silent..."}</p>
            </div>

            <div className="flex justify-center gap-4">
                {!recording ? (
                    <button
                        onClick={startRecording}
                        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
                    >
                        Start Recording
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
                    >
                        Stop Recording
                    </button>
                )}
            </div>
        </div>
    );
}

export default LiveChatbot;
