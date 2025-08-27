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
    // console.log(body);

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

    // console.log(JSON.stringify(imageArray))
    console.log("length: ", imageArray.length)

    let chunkArray: string[][] = []

    for (let i = 0; i < imageArray.length; i+=6) {
      const chunk = imageArray.slice(i, i+6)
      chunkArray.push(chunk)
    }

    let results: (string | undefined)[] = []

    await Promise.all(
      chunkArray.map(async (file, i) => {
        const contents = [
          {
            role: "user",
            parts: [
              {
                text: "Extract the text from the following image(s) and return only OCR'ed text. Remove unnecessary info like paper/college names or page number or image number, auto-correct according to context, and describe diagrams in a way the user can infer them mentally. Do not add comments or any extra data that is not needed."
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
          results.push(response.text)
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
