import { ProcessedFile } from "@/lib/pdfProcessor"
import axios, { AxiosResponse } from "axios"

export interface ApiData {
    files: Array<{
        name: string
        type: 'image' | 'pdf'
        images: string[]
        pageCount: number
    }>
}

interface OcrResponse {
    message: string
    text: string
}

export const sendFilesToApi = async (files: ProcessedFile[]): Promise<AxiosResponse<OcrResponse>> => {
    const apiData: ApiData = {
        files: files.map(file => ({
            name: file.name,
            type: file.type,
            images: file.images,
            pageCount: file.images.length
        }))
    }

    const response: AxiosResponse<OcrResponse> = await axios.post<OcrResponse>(`/api/ocr`, {
        apiData
    })

    if (response.status !== 200) {
        throw new Error(`Error in api response: ${response.statusText}`)
    }

    return response
}