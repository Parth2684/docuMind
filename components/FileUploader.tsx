"use client"

import { useState, useRef, useCallback } from 'react'
import { processFiles } from '@/lib/pdfProcessor'
import TextEditor from '@/components/TextEditor'
import AudioPlayer from '@/components/AudioPlayer'
import { KokoroTTS } from "kokoro-js"

type VoiceType = "af_sky" | "am_michael"

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
  const [ocrText, setOcrText] = useState<string>('')
  const [voice, setVoice] = useState<VoiceType>("af_sky")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [totalChunks, setTotalChunks] = useState<number>(0)
  const [currentChunk, setCurrentChunk] = useState<number>(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...droppedFiles])
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const processAndUpload = async (): Promise<void> => {
    if (files.length === 0) return
    try {
      setIsBusy(true)
      setStatusMessage("📄 Processing uploaded files...")
      const processed = await processFiles(files)

      // Calculate total images for chunk calculation
      const totalImages = processed.reduce((sum, f) => sum + f.images.length, 0)
      const chunks = Math.ceil(totalImages / 6)
      setTotalChunks(chunks)
      setCurrentChunk(0)

      setStatusMessage(`🔍 Extracting text from ${totalImages} page${totalImages > 1 ? 's' : ''} (${chunks} chunk${chunks > 1 ? 's' : ''})...`)
      
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
        setStatusMessage("✅ OCR complete!")
        setTimeout(() => setStatusMessage(null), 3000)
      } else {
        throw new Error(data.message || 'OCR failed')
      }
    } catch (err) {
      console.error(err)
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setStatusMessage(`❌ Error: ${errorMsg}`)
    } finally {
      setIsBusy(false)
      setTotalChunks(0)
      setCurrentChunk(0)
    }
  }

  const generateAudio = async (selectedVoice: VoiceType): Promise<void> => {
    if (!ocrText) return

    try {
      setIsBusy(true)
      setStatusMessage("🎵 Loading TTS model (this may take a moment)...")
      const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
        dtype: "q8",
        device: "wasm"
      })

      setStatusMessage("✂️ Splitting text into sentences...")
      const sentences = ocrText.match(/[^.!?]+[.!?]+/g) || [ocrText]
      console.log(`Total sentences to process: ${sentences.length}`)

      const wavArray: ArrayBuffer[] = []
      for (let i = 0; i < sentences.length; i++) {
        console.log(`Processing sentence ${i + 1}/${sentences.length}`)
        setStatusMessage(`🎙️ Generating audio: ${i + 1}/${sentences.length} sentences...`)
        const audio = await tts.generate(sentences[i], { voice: selectedVoice })
        const wav = audio.toWav()
        wavArray.push(wav)
        console.log(`Completed sentence ${i + 1}, wavArray length: ${wavArray.length}`)
      }
      console.log(`Total wav files generated: ${wavArray.length}`)

      setStatusMessage("🔗 Merging audio chunks...")
      const finalBlob = concatWavs(wavArray)
      const url = URL.createObjectURL(finalBlob)
      setAudioUrl(url)

      setStatusMessage("✅ Audio ready!")
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (err) {
      console.error(err)
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setStatusMessage(`❌ Audio generation failed: ${errorMsg}`)
    } finally {
      setIsBusy(false)
    }
  }

  const reset = (): void => {
    setFiles([])
    setOcrText('')
    setAudioUrl(null)
    setStatusMessage(null)
    setTotalChunks(0)
    setCurrentChunk(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      {/* File Upload Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-[rgb(var(--border))] rounded-xl p-12 text-center cursor-pointer hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--accent))] transition-all duration-200"
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[rgb(var(--primary))] bg-opacity-10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-[rgb(var(--foreground))]">Drop files here or click to browse</p>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">Supports PDF and image files (PNG, JPG, WEBP)</p>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      {statusMessage && (
        <div className="bg-[rgb(var(--primary))] bg-opacity-10 border border-[rgb(var(--primary))] text-[rgb(var(--foreground))] px-4 py-3 rounded-lg flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--primary))]"></div>
          <span className="flex-1">{statusMessage}</span>
          {totalChunks > 0 && (
            <span className="text-sm font-medium">
              {currentChunk}/{totalChunks} chunks
            </span>
          )}
        </div>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
              Selected Files ({files.length})
            </h3>
            <button
              onClick={reset}
              className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--destructive))] transition-colors"
            >
              Clear all
            </button>
          </div>
          <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto scrollbar-thin">
            {files.map((file, idx) => (
              <li key={idx} className="flex items-center justify-between p-3 bg-[rgb(var(--secondary))] rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <svg className="w-5 h-5 text-[rgb(var(--primary))] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-[rgb(var(--foreground))] truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(idx)
                    }}
                    className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--destructive))] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={processAndUpload}
            disabled={isBusy}
            className="w-full px-6 py-3 bg-[rgb(var(--primary))] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
          >
            {isBusy ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Extract Text with OCR
              </>
            )}
          </button>
        </div>
      )}

      {/* OCR Result & Audio Generation */}
      {ocrText && (
        <div className="space-y-6">
          <TextEditor text={ocrText} onChange={setOcrText} />
          
          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Convert to Audio</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="px-4 py-3 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all"
                value={voice}
                onChange={(e) => setVoice(e.target.value as VoiceType)}
                disabled={isBusy}
              >
                <option value="af_sky">🎙️ Female Voice (Sky)</option>
                <option value="am_michael">🎙️ Male Voice (Michael)</option>
              </select>
              <button
                onClick={() => generateAudio(voice)}
                disabled={isBusy}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
              >
                {isBusy ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    Generate Audio
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-3">
              ⚠️ Note: Audio generation happens on your device using WebAssembly. This may take some time depending on text length.
            </p>
          </div>
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
    </div>
  )
}
