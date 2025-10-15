// server-side route
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { initWorkerPool, MAX_WORKERS, runTTS } from '../../../workers/workerPool';

const bodySchema = z.object({
  text: z.string(),
  voice: z.enum(["af_sky", "am_michael"]),
});


initWorkerPool();
// Concatenate WAV buffers incrementally
function concatWavs(wavArray: Buffer[]): Buffer {
  // Validate input
  if (!wavArray || wavArray.length === 0) {
    throw new Error("No WAV buffers to concatenate");
  }
  
  // Filter out any undefined/null buffers and validate they have WAV headers
  const validBuffers = wavArray.filter(b => b && Buffer.isBuffer(b) && b.length > 44);
  
  if (validBuffers.length === 0) {
    throw new Error("No valid WAV buffers found");
  }
  
  // If only one buffer, return it directly
  if (validBuffers.length === 1) {
    return validBuffers[0];
  }

  const header = validBuffers[0].subarray(0, 44);
  const dataParts = validBuffers.map((b) => b.subarray(44));
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

// Split text into ~150 char chunks
function splitText(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let buffer = "";
  
  for (const s of sentences) {
    if ((buffer + s).length > 150) {
      if (buffer) chunks.push(buffer.trim());
      buffer = s;
    } else {
      buffer += s;
    }
  }
  
  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks;
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsedBody = bodySchema.safeParse(body);
    
    if (!parsedBody.success) {
      return NextResponse.json({ message: "Invalid input" }, { status: 411 });
    }

    const { text, voice } = parsedBody.data;
    const textChunks = splitText(text);

    console.log(`Processing ${textChunks.length} text chunks`);

    // Create array to hold results in correct order
    const orderedBuffers: (Buffer | null)[] = new Array(textChunks.length).fill(null);

      
    await Promise.all(
      textChunks.map(async (chunk, idx) => {
        try {
          const buffer = await runTTS(chunk, voice);
          orderedBuffers[idx] = buffer;
          console.log(`Chunk ${idx} done (${buffer.length} bytes)`);
        } catch (err) {
          console.error(`Chunk ${idx} failed:`, err);
        }
      })
    );

    // Filter out any nulls/undefined and validate buffers
    const results = orderedBuffers.filter(
      (b): b is Buffer => b !== null && b !== undefined && Buffer.isBuffer(b) && b.length > 44
    );

    console.log(`Generated ${results.length} valid buffers out of ${textChunks.length} chunks`);

    if (!results.length) {
      throw new Error("No audio generated - all chunks failed");
    }

    const finalWav = concatWavs(results);

    return new NextResponse(new Uint8Array(finalWav), {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": "attachment; filename=output.wav",
      },
    });
  } catch (err) {
    console.error("TTS route error:", err);
    return NextResponse.json({ 
      message: "Server Error", 
      error: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
};