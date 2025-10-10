import { parentPort, workerData } from "node:worker_threads";
import { KokoroTTS } from "kokoro-js";

async function run() {
  const { sentences, voice } = workerData;
  try {
    const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
      dtype: "q8",
      device: "cpu",
    });

    const buffers = [];
    for (const sentence of sentences) {
      const audio = await tts.generate(sentence, { voice });
      const wav = audio?.toWav();
      if (wav) {
        buffers.push(Buffer.from(wav));
      } else {
        console.warn("Skipped a sentence, TTS returned undefined:", sentence);
      }
    }    

    parentPort?.postMessage(buffers);
  } catch (err) {
    parentPort?.postMessage({ error: err.message });
  }
}

run();
