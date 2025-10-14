import { fork, ChildProcess } from 'child_process';
import os from 'os'
import path from "path"


export const MAX_WORKERS = Math.max(2, Math.min(8, process.env.NODE_ENV == "production" ? os.cpus().length/2 : os.cpus().length));
const workers: { proc: ChildProcess; busy: boolean }[] = [];

export function initWorkerPool() {
  if (workers.length == os.cpus().length) return;
  const workerPath = path.resolve(process.cwd(), "workers", "ttsWorker.js");
  
  for (let i = 0; i < MAX_WORKERS; i++) {
    const child = fork(workerPath, [], { stdio: ["pipe", "pipe", "pipe", "ipc"] });
    workers.push({proc: child, busy: false})
  }
  console.log(`initialized ${MAX_WORKERS} tts workers`)
}

export async function runTTS(text: string, voice: string): Promise<Buffer> {
  const worker = await waitForFreeWorker()
  worker.busy = true;
  
  return new Promise ((resolve, reject) => {
    const { proc } = worker;
    
    const onMessage = (msg: any) => {
      if(msg.error) {
        cleanup();
        return reject(new Error(msg.error))
      }
      if(msg.result) {
        cleanup();
        return resolve(Buffer.from(msg.result))
      }
    }
    
    const cleanup = () => {
      worker.busy = false;
      proc.off("message", onMessage)
    }
    
    proc.on("message", onMessage);
    proc.send({ chunk: text, voice })
  })
}

function waitForFreeWorker(): Promise<{ proc: ChildProcess;  busy: boolean}> {
  return new Promise((resolve) => {
    const check = () => {
      const free = workers.find((worker) => !worker.busy)
      if (free) return resolve(free);
      setTimeout(check, 500)
    }
    check()
  })
}