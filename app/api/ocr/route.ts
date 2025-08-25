import { ocr } from "@/lib/ocr";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const apiDataSchema = z.object({
    apiData: z.object({
        files: z.array(
            z.object({
                name: z.string(),
                type: z.string(),
                images: z.array(z.string()),
                pageCount: z.number()
            })
        )
    })
})

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json()
        console.log(body)
        const parsedBody = apiDataSchema.safeParse(body)
        if(!parsedBody.success) {
            return NextResponse.json({
                message: "Body is invalid"
            }, {
                status: 411
            })
        }
        const { files } = parsedBody.data.apiData;
        let ocrResult = "";
        files.map((file) => {
            file.images.map((image) => {
                ocrResult += ocr(image);
            })
        })
        return NextResponse.json({
            message: "Successfull"
        })
        
    } catch (error) {
        console.error(error)
        return NextResponse.json({message: "Server Error"}, {
            status: 500
        })
    }
    
}