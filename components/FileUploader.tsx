"use client"

import { useState, useRef, useCallback, SetStateAction } from 'react'
import { processFiles } from '@/lib/pdfProcessor'
import TextEditor from '@/components/TextEditor'
import AudioPlayer from '@/components/AudioPlayer'
import { KokoroTTS } from "kokoro-js"

function concatWavs(wavArray: ArrayBuffer[]): Blob {
  const buffers = wavArray.map(arr => Buffer.from(arr));
  const header = buffers[0].subarray(0, 44);
  const dataParts = buffers.map(buf => buf.subarray(44));

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
  return new Blob([output], { type: "audio/wav" });
}

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([])
  const [ocrText, setOcrText] = useState('')
  const [voice, setVoice] = useState<"af_sky" | "am_michael">("af_sky")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  // Loading state with detailed messages
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...droppedFiles])
  }, [])

  const processAndUpload = async () => {
    if (files.length === 0) return
    try {
      setIsBusy(true)
      setStatusMessage("Processing uploaded files...")
      const processed = await processFiles(files)

      setStatusMessage("Extracting text with OCR...")
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiData: {
            files: processed.map(f => ({
              ...f,
              pageCount: f.images.length
            }))
          }
        })
      })

      const data = await response.json()
      if (response.ok) {
        setOcrText(data.text)
        setStatusMessage("OCR complete ✅")
      } else {
        throw new Error(data.message)
      }
    } catch (err) {
      console.error(err)
      setStatusMessage("❌ Error during OCR")
    } finally {
      setIsBusy(false)
    }
  }

  const generateAudio = async (voice: "af_sky" | "am_michael") => {
    if (!ocrText) return

    try {
      setIsBusy(true)
      setStatusMessage("Loading TTS model...")
      const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
        dtype: "q8",
        device: "webgpu"
      })

      setStatusMessage("Splitting text into sentences...")
      const sentences = ocrText.match(/[^.!?]+[.!?]+/g) || [ocrText]

      const wavArray: ArrayBuffer[] = []
      for (let i = 0; i < sentences.length; i++) {
        setStatusMessage(`Generating audio chunk ${i + 1}/${sentences.length}...`)
        const audio = await tts.generate(sentences[i], { voice })
        const wav = audio.toWav()
        wavArray.push(wav)
      }

      setStatusMessage("Merging audio chunks...")
      const finalBlob = concatWavs(wavArray)
      const url = URL.createObjectURL(finalBlob)
      setAudioUrl(url)

      setStatusMessage("✅ Audio generation complete")
    } catch (err) {
      console.error(err)
      setStatusMessage("❌ Error generating audio")
    } finally {
      setIsBusy(false)
    }
  }

  const reset = () => {
    setFiles([])
    setOcrText('')
    setAudioUrl(null)
    setStatusMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6 bg-black text-white p-6 rounded-lg">
      {/* File Upload */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-500 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-lg text-gray-300">Drop files here or click to browse</p>
        <p className="text-sm text-gray-400">PDF and images supported</p>
      </div>

      {/* Status Indicator */}
      {statusMessage && (
        <div className="bg-gray-800 text-blue-300 px-4 py-2 rounded-lg animate-pulse">
          {statusMessage}
        </div>
      )}

      {/* Files */}
      {files.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Selected Files ({files.length})</h3>
          <ul className="space-y-2">
            {files.map((file, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span>{file.name}</span>
                <span className="text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-3">
            <button
              onClick={processAndUpload}
              disabled={isBusy}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Extract Text
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* OCR Result */}
      {ocrText && (
        <>
          <TextEditor text={ocrText} onChange={setOcrText} />
          <div className="flex gap-3 mt-4">
            <select
              className="bg-gray-800 px-3 py-2 rounded"
              value={voice}
              onChange={(e) => setVoice(e.target.value as SetStateAction<"af_sky" |"am_michael">)}
            >
              <option value="af_sky">Female</option>
              <option value="am_michael">Male</option>
            </select>
            <button
              onClick={async() => await generateAudio(voice)}
              disabled={isBusy}
              className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Convert to Audio
            </button>
          </div>
        </>
      )}

      {/* Audio */}
      {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
    </div>
  )
}
