import FileUploader from '@/components/FileUploader'

export default function Home() {
  return (
    <main className="mx-auto p-8 max-w-6xl">
      {/* Topbar */}
      <header className="fixed top-0 left-0 w-full bg-black shadow-md z-50 text-center py-4">
        <h1 className="text-3xl font-bold text-white">DocuMind</h1>
        <p className="text-lg text-gray-300">
          Transform your documents into text and audio with AI-powered OCR
        </p>
      </header>

      {/* Push content down so it doesn’t hide behind header */}
      <div className="pt-32 bg-black rounded-2xl shadow-xl p-8">
        <FileUploader />
      </div>

      <footer className="text-center mt-12 text-gray-500 dark:text-gray-400">
        <p>© 2025 DocuMind. Powered by Gemini AI & Kokoro TTS</p>
      </footer>
    </main>
  )
}
