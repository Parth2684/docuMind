import FileUploader from '@/components/FileUploader'

export default function Home() {
  return (
    <main className="mx-auto p-8 max-w-6xl">
      <header className="text-center text-white position-fixed top-0">
        <h1 className="text-3xl font-bold mb-4">
          DocuMind
        </h1>
        <p className="text-xl text-gray-300">
          Transform your documents into text and audio with AI-powered OCR
        </p>
      </header>

      <div className="bg-black rounded-2xl shadow-xl p-8">
        <FileUploader />
      </div>

      <footer className="text-center mt-12 text-gray-500 dark:text-gray-400">
        <p>© 2025 DocuMind. Powered by Gemini AI & Kokoro TTS</p>
      </footer>
    </main>
  )
}