


interface SendButtonProps {
    onSend: () => void
    isProcessing: boolean
    hasFiles: boolean
}
export default function SendButton ({ onSend, isProcessing, hasFiles }: SendButtonProps) {
    if(!hasFiles) return null
    return <div className="flex justify-center">
    <button
      onClick={onSend}
      disabled={isProcessing}
      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {isProcessing ? 'Sending...' : 'Send to API'}
    </button>
  </div>
}