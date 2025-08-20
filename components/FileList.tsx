import { ProcessedFile, FileListItem } from "./FileListItem";



interface FileListProps {
    files: ProcessedFile[]
    onRemoveFile: (index: number) => void
    onClearAll: () => void
    isProcessing: boolean
}

export default function FileList ({ files, onRemoveFile, onClearAll, isProcessing } : FileListProps) {
    if(files.length === 0) return null
    return <div className="mb-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-800">Processed Files</h2>
      <button
        onClick={onClearAll}
        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
        disabled={isProcessing}
      >
        Clear All
      </button>
    </div>
    
    <div className="space-y-3">
      {files.map((file, index) => (
        <FileListItem
          key={index}
          file={file}
          index={index}
          onRemove={onRemoveFile}
          isProcessing={isProcessing}
        />
      ))}
    </div>
  </div>
} 