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


export const sendFilesToApi = async(files: ProcessedFile[]) => {
    const apiData: ApiData = {
        files: files.map(file => ({
            name: file.name,
            type: file.type,
            images: file.images,
            pageCount: file.images.length
        }))
    }

    const response: AxiosResponse = await axios.post(`/api/ocr`, {
        apiData
    })

    if(!(response.status == 200)){
        throw new Error(`Error in api response: ${response}`)
    }

    return response
}