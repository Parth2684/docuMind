// server-side route
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { fork, ChildProcess } from "child_process";
import os from "os";
import path from "path";

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

// Split text into ~50 char chunks
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

// Process a chunk in a child process
function processChunk(chunk: string, voice: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const workerPath = path.resolve(process.cwd(), "workers/ttsWorker.js");
    const child: ChildProcess = fork(workerPath, [], {
      stdio: ["pipe", "pipe", "pipe", "ipc"],
    });

    let resolved = false;

    child.on("message", (msg: any) => {
      if (resolved) return;
      
      if (msg.error) {
        resolved = true;
        child.kill();
        return reject(new Error(msg.error));
      }
      if (msg.result) {
        resolved = true;
        child.kill();
        resolve(Buffer.from(msg.result));
      }
    });

    child.on("exit", (code) => {
      if (!resolved && code !== 0) {
        resolved = true;
        reject(new Error(`Child process exited with code ${code}`));
      }
    });

    child.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        child.kill();
        reject(err);
      }
    });

    // Send the task to child process
    child.send({ chunk, voice });
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

    // Process chunks with limited concurrency
    const results: Buffer[] = [];
    for (let i = 0; i < textChunks.length; i += MAX_WORKERS) {
      const batch = textChunks.slice(i, i + MAX_WORKERS);
      const batchResults = await Promise.all(
        batch.map((chunk) => processChunk(chunk, voice))
      );
      results.push(...batchResults.filter(Boolean));
    }

    // Make sure we have at least one valid buffer
    if (!results.length) throw new Error("No audio generated");

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