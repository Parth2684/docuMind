"use client"

import { useState, useRef, useCallback } from 'react'
import { processFiles, ProcessedFile } from '@/lib/pdfProcessor'
import TextEditor from '@/components/TextEditor'
import AudioPlayer from '@/components/AudioPlayer'
import path from 'path'

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([])
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrText, setOcrText] = useState('')
  const [isLoadingOCR, setIsLoadingOCR] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [voice, setVoice] = useState("")

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

    setIsProcessing(true)
    try {
      const processed = await processFiles(files)
      setProcessedFiles(processed)
      
      // Send to OCR API
      setIsLoadingOCR(true)
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
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Error processing files:', error)
      alert('Error processing files. Please try again.')
    } finally {
      setIsProcessing(false)
      setIsLoadingOCR(false)
    }
  }

  const generateAudio = async (voice: string) => {
    if (!ocrText || !voice) return

    setIsGeneratingAudio(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ocrText,
          voiceDir: path.join,
          voice
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      } else {
        throw new Error('Failed to generate audio')
      }
    } catch (error) {
      console.error('Error generating audio:', error)
      alert('Error generating audio. Please try again.')
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const reset = () => {
    setFiles([])
    setProcessedFiles([])
    setOcrText('')
    setAudioUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6 bg-black">
      {/* File Upload Section */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <svg className="w-5 h-5 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        
        <p className="text-lg text-gray-500 mb-2">Drop files here or click to browse</p>
        <p className="text-sm text-gray-500">Supports PDF and image files</p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Select Files
        </button>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="bg-black text-white rounded-lg p-4">
          <h3 className="font-semibold mb-3">Selected Files ({files.length})</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-black p-3 rounded">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8l4 4v10a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg"> {file.name}</span>
                  <span className="text-xs text-white">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={processAndUpload}
              disabled={isProcessing || isLoadingOCR}
              className="px-6 py-3 mt-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? 'Processing Files...' : isLoadingOCR ? 'Extracting Text...' : 'Extract Text'}
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 mt-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* OCR Text Section */}
      {ocrText && (
        <>
          <TextEditor text={ocrText} onChange={setOcrText} />
          
          <div className="flex justify-center">
            <select defaultValue="af_sky" value={voice} onChange={(e) => setVoice(e.target.value)}>
              <option value="af_sky">Female</option>
              <option value="am_michael">Male</option>
            </select>
            <button
              onClick={() => generateAudio(voice)}
              disabled={isGeneratingAudio}
              className="px-9 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span>{isGeneratingAudio ? 'Generating Audio...' : 'Convert to Audio'}
              </span>
            </button>
          </div>
        </>
      )}

      {/* Audio Player Section */}
      {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
    </div>
  )
}