"use client"
export function Instructions() {
    return (
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Upload images (JPG, PNG, GIF) or PDF files</li>
          <li>• Images are converted to base64 strings</li>
          <li>• PDFs are converted to images on each page, then to base64</li>
          <li>• All data is sent to your API endpoint as JSON</li>
          <li>• No external APIs are used for PDF conversion</li>
        </ul>
      </div>
    );
  }