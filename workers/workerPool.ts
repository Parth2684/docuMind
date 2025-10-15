import { fork, ChildProcess } from 'child_process';
import os from 'os'
import path from "path"

const CPU_COUNT = os.cpus().length

export const MAX_WORKERS = String(process.env.MY_ENV) === "production"
  ? Math.max(2, Math.floor(CPU_COUNT / 2))   // half cores in prod
  : Math.max(4, CPU_COUNT); 
const workers: { proc: ChildProcess; busy: boolean }[] = [];

export function initWorkerPool() {
  if (workers.length > 0) return;
  const workerPath = path.resolve(process.cwd(), "workers", "ttsWorker.js");
  
  for (let i = 0; i < MAX_WORKERS; i++) {
    const child = fork(workerPath, [], { stdio: ["pipe", "pipe", "pipe", "ipc"] });
    child.on('error', (err) => {
        console.error(`Worker ${i} error:`, err);
      });
      
      child.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker ${i} exited with code ${code}`);
        }
      });
    workers.push({proc: child, busy: false})
  }
}

export async function runTTS(text: string, voice: string): Promise<Buffer> {
  const worker = await waitForFreeWorker()
  
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
      if (free) {
        free.busy = true
        return resolve(free)
      }
      setTimeout(check, 100)
    }
    check()
  })
}