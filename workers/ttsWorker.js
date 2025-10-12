// workers/ttsWorker.js



let tts = null;

// Initialize TTS once per worker
async function initTTS() {
  const { KokoroTTS } = await import("kokoro-js");
  if (!tts) {
    tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
      dtype: "q8",
      device: "cpu",
    });
  }
  return tts;
}

process.on("message", async (msg) => {
  try {
    const { chunk, voice } = msg;
    const ttsEngine = await initTTS();
    
    const audio = await ttsEngine.generate(chunk, { voice });
    const wav = audio?.toWav();
    
    if (wav) {
      process.send({ result: Buffer.from(wav) });
    } else {
      process.send({ error: "TTS returned undefined" });
    }
  } catch (err) {
    process.send({ error: err.message });
  }
});