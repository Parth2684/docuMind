export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const bodySchema = z.object({
    text: z.string(),
    voice: z.enum(["af_sky", "am_michael"])
})

export const POST = async(req: NextRequest) => {
    try {
        const body = await req.json()
        const parsedBody = bodySchema.safeParse(body)
        if(!parsedBody.success) {
            return NextResponse.json({
                message: "Please send proper inputs"
            }, {
                status:411
            })
        }
        const { text, voice } = parsedBody.data
        const modelId = "onnx-community/Kokoro-82M-ONNX"

        const { KokoroTTS } = await import("kokoro-js");

        const tts = await KokoroTTS.from_pretrained(modelId, {
            dtype: "q8"
        })

        const audio = await tts.generate(text, {
            voice
        })

        const wav = audio.toWav()

        return new NextResponse(wav, {
            headers: {
                "Content-Type": "audio/wav",
                "Content-Disposition": `inline; filename="speech.wav"` 
            }
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            message: "Server Error"
        }, {
            status: 500
        })
    }
}