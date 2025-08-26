// @ts-nocheck
import {
    Florence2ForConditionalGeneration,
    AutoProcessor,
    load_image,
    Tensor,
  } from "@huggingface/transformers";
  
  export async function ocr(imageBase64: string) {
    try {
      // Strip prefix if present
      const b64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
  
      // Decode base64 → Uint8Array
      const bytes = Buffer.from(b64, "base64");
  
      // ✅ Wrap in a Blob so load_image can parse it
      const blob = new Blob([bytes]);
  
      const image = await load_image(blob);
  
      const model_id = 'onnx-community/Florence-2-base-ft';
      const model = await Florence2ForConditionalGeneration.from_pretrained(model_id, { dtype: "fp32" });
      const processor = await AutoProcessor.from_pretrained(model_id);
  
      const task = "<OCR>";
      const prompts = await processor.construct_prompts(task);
  
      const inputs = await processor(image, prompts);
  
      const generated_ids = await model.generate({
        ...inputs,
        max_new_tokens: 500,
      });
  
      const generatedText = processor.batch_decode(generated_ids as Tensor, { skip_special_tokens: false })[0];
      const result = processor.post_process_generation(generatedText, task, image.size);
  
      return result;
    } catch (error) {
      console.error("OCR error:", error);
      throw error;
    }
  }
  