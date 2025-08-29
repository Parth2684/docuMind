import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import z from "zod";

const apiDataSchema = z.object({
  apiData: z.object({
    files: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        images: z.array(z.string()),
        pageCount: z.number(),
      })
    ),
  }),
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const parsedBody = apiDataSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { message: "Body is invalid" },
        { status: 411 }
      );
    }

    const { files } = parsedBody.data.apiData;

    const imageArray = files.flatMap((imageObject) => {
      return imageObject.images
    })

    if(imageArray.length > 25) {
      return NextResponse.json({
        message: "Too many number of Images please send less than 25 images"
      }, {
        status: 422
      })
    }

    const chunkArray: string[][] = []

    for (let i = 0; i < imageArray.length; i+=6) {
      const chunk = imageArray.slice(i, i+6)
      chunkArray.push(chunk)
    }

    const results = Array(chunkArray.length).fill("")

    await Promise.allSettled(
      chunkArray.map(async (file, i) => {
        const contents = [
          {
            role: "user",
            parts: [
              {
                text: `Extract the text from the following image(s) and return only OCR'ed text. Remove unnecessary info and do not include it in your response like paper/college names or page number or image number, auto-correct according to context, and describe diagrams in a way the user can infer them mentally just by reading and do not return the actual diagrams in any form just return like how a person reads it. Do not add comments or any extra data that is not needed. The response you provide will be read by a text to speech model which will read everything so user can just here it instead of reading so give it in that kind of suitable format with suitable punctuations Customize pronunciation with Markdown link syntax and /slashes/ like [Kokoro](/kˈOkəɹO/), To adjust intonation, try punctuation ;:,.!?—…"()“” or stress ˈ andˌLower stress [1 level](-1) or [2 levels](-2), Raise stress 1 level [or](+2) 2 levels (only works on less stressed, usually short words)`
              },
              ...file.map((image) => ({
                inlineData: { data: image, mimeType: "image/webp" }
              }))
            ]
          }
        ]

        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite" ,
            contents
          })
          results[i] = response.text
        } catch (error) {
          console.error(error)
          throw new Error(`Error from ${i}th file`)
        }
      })
    )

    const data = results.join("\n\n")

    return NextResponse.json({
      message: "Successful",
      text: data,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server Error", error },
      { status: 500 }
    );
  }
};
