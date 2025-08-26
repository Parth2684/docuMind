import { ocr } from "@/lib/ocr";
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
    console.log(body);
    const parsedBody = apiDataSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { message: "Body is invalid" },
        { status: 411 }
      );
    }

    const { files } = parsedBody.data.apiData;

    let data: string;

    const imagesArray = files.map((file) => ( {
      images: file.images
    }))


    imagesArray.map(async (imagesArray)=> {
      const content = imagesArray.images.map((image) => ({
        image,
        text: "Extract the text from the followning image and return the output, remove the unnecessary thing like of the paper industry or college name or anything like that auto correct words according to the topic of the context and if there are diagrams return the text in such a way that user can infer the diagram in his mind and do not add any comments from your side only return the text which is being ocr'ed"
      }))
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-vision",
        contents: content
      })

      data = data + response.text
    }) 

    NextResponse.json({
      message: "Successful",
      text: data
    })

        
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
};
