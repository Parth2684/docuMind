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


if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

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
            parts: [
              ...file.map((image) => ({
                inlineData: { data: image, mimeType: "image/webp" }
              }))
            ]
          }
        ]

        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite" ,
            contents,
            config: {
              systemInstruction: `You are an OCR and text transcription assistant.
              
              Task: Extract text from the provided image(s) and produce a clean, speech-friendly transcript.
              
              Instructions for Output:
              
              Content:
              
              Return only the OCR’d text.
              
              Remove extraneous information: college/university names, document titles, page numbers, image numbers.
              
              Do not include diagrams or images; describe them clearly and concisely for a listener to mentally visualize.
              
              Convert tables, charts, and difference tables into descriptive, speech-friendly summaries, explaining rows, columns, and key comparisons.
              
              Auto-correct spelling and grammatical errors contextually.
              
              Convert symbols and non-verbal text into spoken equivalents (e.g., ".net" → "dotnet", "C#" → "C sharp", "&" → "and", "%" → "percent", "@" → "at", "/" → "slash", "-" → "dash" if connector, "_" → "underscore").
              
              Expand abbreviations or acronyms where meaning is clear to improve speech clarity.
              
              Formatting:
              
              Output must be a single continuous block of text structured as natural spoken language.
              
              Use punctuation (: ; , . ! ? — ... ( ) “ ”) for natural intonation and pauses.
              
              Use stress marks (ˈ, ˌ) to indicate stressed syllables for pronunciation.
              
              For non-standard pronunciations, use Markdown link syntax with slash notation (e.g., Kokoro`
            }
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
