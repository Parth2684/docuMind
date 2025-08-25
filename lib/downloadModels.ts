import fetch from "node-fetch";
import fs from "fs-extra";
import path from "path";

const BASE_RAW_URL = "https://huggingface.co/onnx-community/Florence-2-base-ft/resolve/main/onnx";

const REQUIRED_FILES = [
  "embed_tokens.onnx",
  "decoder_model_merged.onnx",
  "encoder_model.onnx",
  "vision_encoder.onnx",
];

const TARGET_DIR = path.resolve(
  "node_modules/@huggingface/transformers/.cache/onnx-community/Florence-2-base-ft/onnx"
);

async function downloadFiles() {
  await fs.ensureDir(TARGET_DIR);

  for (const filename of REQUIRED_FILES) {
    const url = `${BASE_RAW_URL}/${filename}`;
    const dest = path.join(TARGET_DIR, filename);

    console.log(`Downloading ${url}...`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to fetch ${url}: ${res.statusText}`);
      continue;
    }
    const buffer = await res.arrayBuffer();
    await fs.writeFile(dest, Buffer.from(buffer));
    console.log(`Saved ${filename} to ${dest}`);
  }

  console.log("Done downloading Florence-2 .onnx files!");
}

downloadFiles().catch(console.error);
