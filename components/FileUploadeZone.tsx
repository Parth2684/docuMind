"use client"
import { ChangeEvent } from "react"
import { UploadIcon } from "./ui/Icons"



interface FileUploadZoneProps{
    isProcessing: boolean
    onFileChange: (event: ChangeEvent<HTMLInputElement> ) => void
}

export default function FileUploadZone ({ isProcessing, onFileChange }: FileUploadZoneProps) {
    return <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input 
                type="file"
                multiple
                accept="image/*, application/pdf"
                onChange={onFileChange}
                className="hidden"
                id="file-upload"
                disabled={isProcessing}
            />
            <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
            >
                <UploadIcon />
                <span className="text-lg font-medium text-gray-600">
                    {isProcessing ? 'Processing' : 'Click To Upload Images or PDFs'}
                </span>
                <span className="text-sm text-gray-400">
                    Supports only Images and PDFs
                </span>
            </label>
        </div>
    </div>
} 