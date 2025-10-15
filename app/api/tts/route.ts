// server-side route
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { initWorkerPool, MAX_WORKERS, runTTS } from '../../../workers/workerPool';
const bodySchema = z.object({
  text: z.string(),
  voice: z.enum(["af_sky", "am_michael"]),
});

initWorkerPool()

// Concatenate WAV buffers incrementally
function concatWavs(wavArray: Buffer[]): Buffer {
  const header = wavArray[0].subarray(0, 44);
  const dataParts = wavArray.map((b) => b.subarray(44));
  const totalDataLength = dataParts.reduce((sum, b) => sum + b.length, 0);

  const output = Buffer.alloc(44 + totalDataLength);
  header.copy(output, 0);
  output.writeUInt32LE(36 + totalDataLength, 4);
  output.writeUInt32LE(totalDataLength, 40);

  let offset = 44;
  for (const part of dataParts) {
    part.copy(output, offset);
    offset += part.length;
  }
  return output;
}

// Split text into ~50 char chunks
function splitText(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let buffer = "";

  for (const s of sentences) {
    if ((buffer + s).length > 150) {
      chunks.push(buffer);
      buffer = s;
    } else {
      buffer += s;
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks;
}


export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsedBody = bodySchema.safeParse(body);
    if (!parsedBody.success)
      return NextResponse.json({ message: "Invalid input" }, { status: 411 });

    const { text, voice } = parsedBody.data;
    const textChunks = splitText(text);

    // Process chunks with limited concurrency
    const results: Buffer[] = [];
    const promises = textChunks.map((chunk, index) => 
          runTTS(chunk, voice).then(buffer => ({ index, buffer }))
        );
    
        // Wait for all to complete
        const unorderedResults = await Promise.all(promises);
    
        // Sort by original index to restore order
        const orderedBuffers = unorderedResults
          .sort((a, b) => a.index - b.index)
          .map(r => r.buffer)
          .filter(Boolean);

    
    // Make sure we have at least one valid buffer
    if (!orderedBuffers.length) throw new Error("No audio generated");

    const finalWav = concatWavs(results);

    return new NextResponse(new Uint8Array(finalWav), {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": "attachment; filename=output.wav",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
};
