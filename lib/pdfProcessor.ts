import * as pdfjsLib from "pdfjs-dist"

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

export interface ProcessedFile {
    name: string
    type: 'image' | 'pdf'
    images: string[]
}

export const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

export const convertPdfToImage = async (file: File): Promise<string[]> => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const images: string[] = []

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const scale = 2
        const viewPort = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) {
            throw new Error("Could not get 2D context from canvas");
          }
        canvas.height = viewPort.height
        canvas.width = viewPort.width

        await page.render({
            canvasContext: context!,
            viewport:viewPort,
            canvas
        }).promise

        const imageData = canvas.toDataURL('image/png')
        images.push(imageData.split(',')[1])
    }
    return images
}

export const processFiles = async(selctedFiles: File[]): Promise<ProcessedFile[]> => {
    const processFiles: ProcessedFile[] = []

    for(const file of selctedFiles) {
        const fileType = file.type
        if(fileType.startsWith('image/')) {
            const base64 = await convertFileToBase64(file)
            processFiles.push({
                name: file.name,
                type: 'image',
                images: [base64]
            })
        }
        else if (fileType == "application/pdf ") {
            const images = await convertPdfToImage(file);
            processFiles.push({
                name: file.name,
                type: 'pdf',
                images: images,
            })
        }
    }
}