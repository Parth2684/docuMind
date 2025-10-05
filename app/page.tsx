"use client"

import FileUploader from '@/components/FileUploader'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="mx-auto p-4 sm:p-8 max-w-7xl">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 bg-[rgb(var(--card))] border-b border-[rgb(var(--border))] shadow-sm z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
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
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/guide" 
                className="px-3 py-1.5 text-sm font-medium text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] transition-colors"
              >
                Guide
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Push content down so it doesn't hide behind header */}
      <div className="pt-24 pb-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--foreground))] mb-3">
            Transform Your Documents
          </h2>
          <p className="text-base sm:text-lg text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto">
            Upload PDFs or images, extract text with AI-powered OCR, and convert to natural-sounding audio
          </p>
        </div>

        <div className="bg-[rgb(var(--card))] rounded-2xl shadow-lg border border-[rgb(var(--border))] p-4 sm:p-8">
          <FileUploader />
        </div>
      </div>

      <footer className="text-center mt-12 pb-8 text-[rgb(var(--muted-foreground))] text-sm">
        <p> 2025 DocuMind. Powered by Gemini AI & Kokoro TTS</p>
      </footer>
    </main>
  )
}
