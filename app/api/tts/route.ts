export const runtime = "nodejs";

import { KokoroTTS } from "kokoro-js";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const bodySchema = z.object({
    text: z.string(),
    voice: z.enum(["af_sky", "am_michael"])
})

function concatWavs(wavArray: ArrayBuffer[]): Buffer {
  const buffers = wavArray.map(arr => Buffer.from(arr));
  
  const header = buffers[0].subarray(0, 44); // standard WAV header size
  const dataParts = buffers.map(buf => buf.subarray(44)); // strip headers
  
  const totalDataLength = dataParts.reduce((sum, b) => sum + b.length, 0);
  
  const output = Buffer.alloc(44 + totalDataLength);
  header.copy(output, 0);
  
  // Fix header sizes
  output.writeUInt32LE(36 + totalDataLength, 4); // RIFF chunk size
  output.writeUInt32LE(totalDataLength, 40); // data chunk size
  
  // Copy PCM chunks
  let offset = 44;
  for (const part of dataParts) {
    part.copy(output, offset);
    offset += part.length;
  }
  
  return output;
}

let tts: KokoroTTS | null = null;

async function getTTS() {
  if (!tts) {
    const { KokoroTTS } = await import("kokoro-js");
    const modelId = "onnx-community/Kokoro-82M-ONNX";
    tts = await KokoroTTS.from_pretrained(modelId, {
      dtype: "q8",
      device: "cpu"
    });
  }
  return tts;
}

export const POST = async(req: NextRequest) => {
    try {
        const body = await req.json()
        const parsedBody = bodySchema.safeParse(body)
        if(!parsedBody.success) {
            return NextResponse.json({
                message: "Please send proper inputs"
            }, {
                status:411
            })
        }
        const { text, voice } = parsedBody.data

        const sentences = text.match(/[^.!?]+[.!?]+/g) || []
        const tts = await getTTS()
        
        const wavArray: ArrayBuffer[] = []
        for (let i = 0; i < sentences.length; i++) {
          const audio = await tts.generate(sentences[i], {
              voice
          })
          const wav = audio.toWav()
          wavArray.push(wav)
        }

        const finalWav = concatWavs(wavArray)
        
        return new NextResponse(new Uint8Array(finalWav), { 
          headers: {
            "Content-Type": "audio/wav",
            "Content-Disposition": "attachment; filename=output.wav"
        }})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            message: "Server Error"
        }, {
            status: 500
        })
    }
}