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
                text: `Task: Perform Optical Character Recognition (OCR) on the image(s) provided.

                      Instructions for Output:

                      1. Content:
                        a. Return ONLY the OCR'd text from the image(s).
                        b. Remove all extraneous information, including but not limited to:
                            - College or university names.
                            - Paper titles or document names.
                            - Page numbers or image numbers.
                        c. Do not include any diagrams or images in the output. Instead, describe them clearly and concisely so that a listener using text-to-speech can mentally visualize what the diagram represents.
                        d. If a table, chart, or difference table is present, convert it into a descriptive, speech-friendly format. Clearly explain what the table represents, summarizing rows, columns, and key comparisons in a way that allows the listener to understand its structure and meaning without seeing it. Avoid reading it as plain OCR text.
                        e. Auto-correct any spelling or grammatical errors based on contextual meaning.
                        f. Convert non-verbal text or symbols into spoken equivalents. For example:
                            - ".net" → "dotnet"
                            - "C#" → "C sharp"
                            - "C++" → "C plus plus"
                            - "&" → "and"
                            - "%" → "percent"
                            - "@" → "at"
                            - "/" → "slash"
                            - "-" → "dash" (only if it represents a connector, not a minus sign)
                            - "_" → "underscore"
                        g. Expand abbreviations or acronyms when their meaning is clear from context to improve speech clarity.

                      2. Formatting:
                        a. The final output must be a single continuous block of text, structured as natural spoken language.
                        b. Do not include comments, notes, or extra data unrelated to the original image content.
                        c. Use punctuation marks (: ; , . ! ? — ... ( ) “ ”) to control intonation and pauses for natural speech.
                        d. Use stress marks (ˈ, ˌ) to indicate stressed syllables for better pronunciation accuracy.
                        e. For words with non-standard pronunciation, use Markdown link syntax with slash notation (for example, [Kokoro](/kˈOkəɹO/)).
                        f. Adjust stress levels of words using [+1] or [+2] for emphasis and [-1] or [-2] for de-emphasis.
                        g. Do not use any asterisks (*) for list formatting or text bolding.
                        h. If the ocr is of question answer keep question number at the start so the user would know which question number is going on, add a fullstop or question mark at the end of the question and also add "Answer:" before the answer starts so user knows that question is over 

                      Final Goal:
                      Produce a clean, accurate, and natural-sounding transcript that can be fed directly into a text-to-speech model, ensuring the listener experiences clear, expressive, and contextually correct audio output.`
              },
              ...file.map((image) => ({
                inlineData: { data: image, mimeType: "image/webp" }
              }))
            ]
          }
        ]

        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite" ,
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
