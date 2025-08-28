"use client"

import { useState } from 'react'

interface TextEditorProps {
  text: string
  onChange: (text: string) => void
}

export default function TextEditor({ text, onChange }: TextEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(text)

  const handleSave = () => {
    onChange(editedText)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedText(text)
    setIsEditing(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Text copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err))
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Extracted Text</h3>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 text-sm bg-black text-white rounded"
          >
            Copy
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full h-96 p-4 border border-gray-300 bg-black rounded-lg resize-y"
        />
      ) : (
        <div className="bg-black p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{text}</pre>
        </div>
      )}
    </div>
  )
}