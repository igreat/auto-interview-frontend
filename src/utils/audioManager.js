const CHUNK_TIME_MS = 2000;

export class AudioManager {
    constructor(onStopRecording, onSpeakingStateChange, silenceTimeMs, silenceThreshold, speakingThreshold) {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioContext = null;
        this.source = null;
        this.analyser = null;
        this.dataArray = null;
        this.silenceTimer = null;
        this.isSpeaking = false;
        this.recording = false;
        this.detectSilenceRef = null;

        this.onStopRecording = onStopRecording; // Callback when recording stops
        this.onSpeakingStateChange = onSpeakingStateChange; // Callback for speaking/silence state

        // Silence detection parameters
        this.silenceTimeMs = silenceTimeMs;
        this.silenceThreshold = silenceThreshold;
        this.speakingThreshold = speakingThreshold;
    }

    async startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);

        // Initialize Audio Context
        this.audioContext = new AudioContext();
        this.source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.source.connect(this.analyser);

        // Start silence detection
        this.recording = true;
        this.detectSilenceRef = requestAnimationFrame(this.detectSpeakingAndSilence);

        this.mediaRecorder.ondataavailable = (event) => {
            this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
            this.audioChunks = [];
            this.onStopRecording(audioBlob);
        };

        this.mediaRecorder.start(CHUNK_TIME_MS); // Record in chunks
    }

    stopRecording() {
        this.recording = false;
        this.mediaRecorder?.stop();
        this.mediaRecorder = null;

        this.audioContext?.close();
        this.audioContext = null;

        this.source?.disconnect();
        this.source = null;

        this.analyser?.disconnect();
        this.analyser = null;

        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;

        cancelAnimationFrame(this.detectSilenceRef);
        this.detectSilenceRef = null;

        this.isSpeaking = false;
    }

    detectSpeakingAndSilence = () => {
        this.analyser.getByteFrequencyData(this.dataArray);
        const averageVolume = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;

        if (averageVolume > this.speakingThreshold) {
            // Detected speaking
            if (!this.isSpeaking) {
                this.isSpeaking = true;
                clearTimeout(this.silenceTimer);
                this.onSpeakingStateChange(true); // Notify that speaking is detected
            }
        } else if (averageVolume < this.silenceThreshold) {
            // Detected silence
            if (this.isSpeaking) {
                if (!this.silenceTimer) {
                    this.silenceTimer = setTimeout(() => {
                        this.isSpeaking = false;
                        this.onSpeakingStateChange(false); // Notify that silence is detected
                        this.stopRecording();
                    }, this.silenceTimeMs);
                }
            }
        }

        if (this.recording) {
            this.detectSilenceRef = requestAnimationFrame(this.detectSpeakingAndSilence); // Continue loop
        }
    };
}
