// server-side route
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { Worker } from "node:worker_threads";
import os from "os";
import path from "node:path";

const bodySchema = z.object({
  text: z.string(),
  voice: z.enum(["af_sky", "am_michael"]),
});

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

// Split text into ~300 char chunks
function splitText(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let buffer = "";

  for (const s of sentences) {
    if ((buffer + s).length > 50) {
      chunks.push(buffer);
      buffer = s;
    } else {
      buffer += s;
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks;
}

// Worker runner
function runWorker(sentences: string[], voice: string): Promise<Buffer[]> {
  return new Promise((resolve, reject) => {
    const workerFile = path.resolve(process.cwd(), "workers/ttsWorker.js");
    const worker = new Worker(workerFile, { workerData: { sentences, voice } });

    worker.on("message", (data: any) => {
      if (data.error) return reject(new Error(data.error));
      // Convert ArrayBuffers back to Node Buffers and filter out undefined
      const buffers: Buffer[] = data
        .filter((b: any) => b) 
        .map((b: ArrayBuffer) => Buffer.from(b));
      resolve(buffers);
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

// Max workers = CPU cores or 8
const MAX_WORKERS = Math.max(2, Math.min(8, os.cpus().length));

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsedBody = bodySchema.safeParse(body);
    if (!parsedBody.success)
      return NextResponse.json({ message: "Invalid input" }, { status: 411 });

    const { text, voice } = parsedBody.data;
    const textChunks = splitText(text);

    // Split chunks evenly among workers
    const chunkedForWorkers: string[][] = [];
    const chunkSize = Math.ceil(textChunks.length / MAX_WORKERS);
    for (let i = 0; i < textChunks.length; i += chunkSize) {
      chunkedForWorkers.push(textChunks.slice(i, i + chunkSize));
    }

    // Progressive merging
    const finalBuffers: Buffer[] = [];
    for (const workerChunk of chunkedForWorkers) {
      const results = await runWorker(workerChunk, voice);
      finalBuffers.push(...results.filter(b => b)); // <-- filter undefined
    }

    // Make sure we have at least one valid buffer
    if (!finalBuffers.length) throw new Error("No audio generated");

    const finalWav = concatWavs(finalBuffers);

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
