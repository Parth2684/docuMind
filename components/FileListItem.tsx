"use client"
import { CloseIcon, ImageIcon, PdfIcon } from "./ui/Icons";



export interface ProcessedFile {
    name: string;
    type: 'image' | 'pdf'
    images: string[]
}

interface FileListItemProps {
    file: ProcessedFile
    index: number
    onRemove: (index: number) => void
    isProcessing: boolean
}

export function FileListItem ({ file, index, onRemove, isProcessing }: FileListItemProps) {
    return <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        {file.type === 'pdf' ? <PdfIcon /> : <ImageIcon />}
      </div>
      <div>
        <p className="font-medium text-gray-900">{file.name}</p>
        <p className="text-sm text-gray-500">
          {file.type === 'pdf' ? `${file.images.length} pages` : '1 image'}
        </p>
      </div>
    </div>
    <button
      onClick={() => onRemove(index)}
      className="text-red-500 hover:text-red-700"
      disabled={isProcessing}
    >
      <CloseIcon />
    </button>
  </div>
}