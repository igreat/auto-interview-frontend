import { useState, useRef } from "react";
import { AudioManager } from "./utils/audioManager";
import { transcribeAudio, getChatResponse } from "./utils/chatAPI";
import { Loader } from "@react-three/drei";
import { Leva } from "leva";
import { Canvas } from "@react-three/fiber";
import Experience from "./components/Experience";

function LiveChatbot() {
  const [transcription, setTranscription] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [recording, setRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Track speaking state
  const audioManagerRef = useRef(null);

  const handleStopRecording = async (audioBlob) => {
    try {
      const transcriptionData = await transcribeAudio(audioBlob);
      setTranscription((prev) => `${prev} ${transcriptionData.text}`);

      const chatData = await getChatResponse(transcriptionData.text);
      setChatResponse(chatData.choices[0].message.content);

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
      <Loader />
      <Leva />
      <Canvas shadows camera={{ position: [10, 0, 8], fov: 30 }}>
        <Experience />
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
