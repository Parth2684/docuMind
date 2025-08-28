import type { Metadata } from 'next'
import './globals.css'


export const metadata: Metadata = {
  title: 'DocuMind - OCR & Text-to-Speech',
  description: 'Convert PDFs and images to text with OCR and generate audio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-black">
          {children}
        </div>
      </body>
    </html>
  )
}