// utils/convertToWav.js
let ffmpeg;

export const convertToWav = async (audioBlob) => {
    if (!ffmpeg) {
        const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg');
        ffmpeg = createFFmpeg({ log: true });
    }

    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
    }

    // Convert Blob to ArrayBuffer for ffmpeg
    const inputAudio = await audioBlob.arrayBuffer();

    // Write the input file to ffmpeg's virtual filesystem
    ffmpeg.FS('writeFile', 'input.mp3', new Uint8Array(inputAudio));

    // Run the ffmpeg command to convert mp3 to wav
    await ffmpeg.run('-i', 'input.mp3', 'output.wav');

    // Read the output file from ffmpeg's virtual filesystem
    const outputAudio = ffmpeg.FS('readFile', 'output.wav');

    // Create a Blob for the .wav file
    return new Blob([outputAudio.buffer], { type: 'audio/wav' });
};
