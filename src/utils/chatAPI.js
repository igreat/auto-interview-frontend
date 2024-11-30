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
