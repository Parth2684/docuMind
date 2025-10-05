'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import Image from 'next/image'

export default function GuidePage() {
  return (
    <main className="mx-auto p-4 sm:p-8 max-w-5xl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[rgb(var(--card))] border-b border-[rgb(var(--border))] shadow-sm z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <Image 
                  src="/favicon.ico" 
                  alt="DocuMind Logo" 
                  width={32} 
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))]">DocuMind</h1>
                <p className="text-xs text-[rgb(var(--muted-foreground))] hidden sm:block">AI-Powered OCR & TTS</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="px-3 py-1.5 text-sm font-medium text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] transition-colors"
              >
                Home
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="pt-24 pb-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[rgb(var(--foreground))] mb-3">
            User Guide
          </h2>
          <p className="text-lg text-[rgb(var(--muted-foreground))]">
            Learn how to use DocuMind to transform your documents into text and audio
          </p>
        </div>

        <div className="space-y-8">
          {/* What is DocuMind */}
          <section className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
            <h3 className="text-2xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What is DocuMind?
            </h3>
            <p className="text-[rgb(var(--foreground))] leading-relaxed">
              DocuMind is an AI-powered document processing application that combines Optical Character Recognition (OCR) 
              and Text-to-Speech (TTS) technology. It allows you to extract text from PDFs and images using Google&apos;s Gemini AI, 
              and then convert that text into natural-sounding audio using Kokoro TTS.
            </p>
          </section>

          {/* How It Works */}
          <section className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
            <h3 className="text-2xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              How It Works
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[rgb(var(--primary))] bg-opacity-10 rounded-full flex items-center justify-center text-[rgb(var(--primary))] font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">Upload Documents</h4>
                  <p className="text-[rgb(var(--muted-foreground))]">
                    Upload PDF files or images (PNG, JPG, WEBP) by dragging and dropping them into the upload zone or clicking to browse.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[rgb(var(--primary))] bg-opacity-10 rounded-full flex items-center justify-center text-[rgb(var(--primary))] font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">OCR Processing</h4>
                  <p className="text-[rgb(var(--muted-foreground))]">
                    Click &quot;Extract Text with OCR&quot; to process your documents. The app converts PDFs to images and sends them to 
                    Google&apos;s Gemini AI in chunks of 6 pages at a time for optimal processing. The AI extracts text, corrects 
                    spelling errors, and formats it for natural speech output.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[rgb(var(--primary))] bg-opacity-10 rounded-full flex items-center justify-center text-[rgb(var(--primary))] font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">Edit Text (Optional)</h4>
                  <p className="text-[rgb(var(--muted-foreground))]">
                    Review the extracted text and make any necessary edits. You can copy the text to your clipboard or 
                    modify it before converting to audio.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[rgb(var(--primary))] bg-opacity-10 rounded-full flex items-center justify-center text-[rgb(var(--primary))] font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">Generate Audio</h4>
                  <p className="text-[rgb(var(--muted-foreground))]">
                    Choose between female (Sky) or male (Michael) voice, then click &quot;Generate Audio&quot;. The text will be 
                    converted to natural-sounding speech using Kokoro TTS running on your device.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[rgb(var(--primary))] bg-opacity-10 rounded-full flex items-center justify-center text-[rgb(var(--primary))] font-semibold">
                  5
                </div>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">Listen & Download</h4>
                  <p className="text-[rgb(var(--muted-foreground))]">
                    Use the audio player to listen to your document. You can control playback, adjust volume, and download 
                    the audio file for offline use.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
            <h3 className="text-2xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Key Features
            </h3>
            <ul className="grid sm:grid-cols-2 gap-3">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[rgb(var(--foreground))]">AI-powered OCR with Gemini 2.0 Flash</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[rgb(var(--foreground))]">Natural-sounding TTS with Kokoro</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[rgb(var(--foreground))]">Support for PDFs and images</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[rgb(var(--foreground))]">Editable extracted text</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[rgb(var(--foreground))]">Multiple voice options</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[rgb(var(--foreground))]">Downloadable audio files</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[rgb(var(--foreground))]">Light and dark mode support</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[rgb(var(--foreground))]">Client-side TTS processing</span>
              </li>
            </ul>
          </section>

          {/* Important Notes */}
          <section className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
            <h3 className="text-2xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[rgb(var(--warning))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Important Notes
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-[rgb(var(--warning))] bg-opacity-10 rounded-lg">
                <svg className="w-5 h-5 text-[rgb(var(--warning))] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">TTS Processing Time</h4>
                  <p className="text-[rgb(var(--foreground))] text-sm">
                    Audio generation happens entirely on your device using WebAssembly (WASM). This ensures privacy but may 
                    take longer than server-side processing, especially for longer texts. The first generation may take extra 
                    time as the model loads.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-[rgb(var(--primary))] bg-opacity-10 rounded-lg">
                <svg className="w-5 h-5 text-[rgb(var(--primary))] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">Privacy & Security</h4>
                  <p className="text-[rgb(var(--foreground))] text-sm">
                    OCR processing is done via Google&apos;s Gemini API (requires internet), but TTS runs entirely in your browser. 
                    Your audio never leaves your device.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-[rgb(var(--primary))] bg-opacity-10 rounded-lg">
                <svg className="w-5 h-5 text-[rgb(var(--primary))] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <div>
                  <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">Document Limits</h4>
                  <p className="text-[rgb(var(--foreground))] text-sm">
                    For optimal performance, the app processes up to 25 images at a time. Large PDFs are automatically split 
                    into chunks of 6 pages for processing.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
            <h3 className="text-2xl font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[rgb(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Tips for Best Results
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[rgb(var(--primary))] font-bold">•</span>
                <span className="text-[rgb(var(--foreground))]">Use high-quality, clear images or PDFs for better OCR accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgb(var(--primary))] font-bold">•</span>
                <span className="text-[rgb(var(--foreground))]">Review and edit the extracted text before generating audio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgb(var(--primary))] font-bold">•</span>
                <span className="text-[rgb(var(--foreground))]">For long documents, consider processing them in smaller batches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgb(var(--primary))] font-bold">•</span>
                <span className="text-[rgb(var(--foreground))]">Keep your browser tab active during TTS generation for best performance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgb(var(--primary))] font-bold">•</span>
                <span className="text-[rgb(var(--foreground))]">Use a modern browser (Chrome, Edge, Firefox) for optimal compatibility</span>
              </li>
            </ul>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[rgb(var(--primary))] to-purple-600 text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      <footer className="text-center mt-12 pb-8 text-[rgb(var(--muted-foreground))] text-sm">
        <p>© 2025 DocuMind. Powered by Gemini AI & Kokoro TTS</p>
      </footer>
    </main>
  )
}
