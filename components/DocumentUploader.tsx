"use client"

import { sendFilesToApi } from "@/lib/apiService"
import { ProcessedFile, processFiles } from "@/lib/pdfProcessor"
import { FC, useRef, useState } from "react"
import FileUploadZone from "./FileUploadeZone"
import ErrorAlert from "./ui/ErrorAlert"
import { ProcessingAlert } from "./ui/ProcessingAlert"
import FileList from "./FileList"
import SendButton from "./SendButton"
import { Instructions } from "./ui/Instructions"



export const DocumentUploader: FC = () => {
    const [files, setFiles] = useState<ProcessedFile[]>()
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        if (selectedFiles.length === 0) return;
    
        setIsProcessing(true);
        setError('');
    
        try {
          const processedFiles = await processFiles(selectedFiles);
          setFiles(prevFiles => [...(prevFiles || []), ...processedFiles]);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred while processing files');
        } finally {
          setIsProcessing(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
    
      const handleSendToApi = async () => {
        if (files?.length === 0) {
          setError('No files to send');
          return;
        }
    
        setIsProcessing(true);
        setError('');
    
        try {
          const result = await sendFilesToApi(files!);
          console.log('API Response:', result);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to send files to API');
        } finally {
          setIsProcessing(false);
        }
      };
    
      const removeFile = (index: number) => {
        setFiles(files?.filter((_, i) => i !== index));
      };
    
      const clearAll = () => {
        setFiles([]);
        setError('');
      };
    
      return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Document Processor</h1>
          
          <FileUploadZone isProcessing={isProcessing} onFileChange={handleFileUpload} />
          
          {error && <ErrorAlert error={error} />}
          
          {isProcessing && <ProcessingAlert />}
          
          <FileList
            files={files || []}
            onRemoveFile={removeFile}
            onClearAll={clearAll}
            isProcessing={isProcessing}
          />
          
          <SendButton
            onSend={handleSendToApi}
            isProcessing={isProcessing}
            hasFiles={files?.length as number > 0}
          />
          
          <Instructions />
        </div>
      )
}