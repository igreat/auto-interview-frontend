const API_KEY = import.meta.env.VITE_API_KEY;

export const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${API_KEY}` },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Transcription failed");
    }

    return response.json();
};

export const generateSpeech = async (inputText) => {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "tts-1",
            voice: "alloy", // Choose a voice from OpenAI's available options
            input: inputText,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "TTS generation failed");
    }

    // Convert the response into a Blob
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob); // Create a URL for audio playback
};

export const getChatResponse = async (text) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: text }],
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Chat response failed");
    }

    return response.json();
};
