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
                1.  Content:
                    * Return ONLY the OCR'd text from the image(s).
                    * Remove all extraneous information, including, but not limited to:
                        * College or university names.
                        * Paper titles or names.
                        * Page numbers or image numbers.
                    * Crucially, do not include any diagrams or images in the output. Instead, describe them clearly and concisely so that a user listening to the text-to-speech output can easily infer what the diagram represents mentally.
                    * Auto-correct any spelling or grammatical errors based on the context of the surrounding text.
                2.  Formatting:
                    * The final output should be a single block of text, structured as if it were being read by a person.
                    * Do not add any comments, notes, or extra data that is not part of the original image's content.
                    * Use punctuation (: ; , . ! ? — ... ( ) “ ”) to control the intonation and pauses for the text-to-speech model, making the speech sound more natural.
                    * Use stress marks (ˈ, ˌ) to indicate stressed syllables for improved pronunciation.
                    * For words with a non-standard or specific pronunciation, use Markdown link syntax with slash notation (e.g., [Kokoro](/kˈOkəɹO/)) to explicitly define how they should be pronounced.
                    * Adjust the stress level of specific words using the [+1] or [+2] notation to raise stress, and [-1] or [-2] to lower stress.
                    * Do not include any * for showing bold texts
                Final Goal: The final text should be a clean, accurate, and ready-to-use transcript that can be fed directly into a text-to-speech model, providing a seamless and high-quality listening experience for the user.`
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
