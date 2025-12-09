
import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFileSync } from "fs";

// Use credentials from the Nanobanana environment variables
const API_KEY = process.env.NANOBANANA_GEMINI_API_KEY;
const MODEL_NAME = process.env.NANOBANANA_MODEL || "gemini-3-pro-image-preview";

if (!API_KEY) {
  console.error("Error: NANOBANANA_GEMINI_API_KEY is not set.");
  process.exit(1);
}

console.log(`Using model: ${MODEL_NAME}`);

const genAI = new GoogleGenerativeAI(API_KEY);

async function generateImage() {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseModalities: ["Image"],
    },
  });

  const prompt = "Photorealistic, high-end hero image of a luxury living room. A friendly female pet sitter is sitting on the floor interacting with 3 happy dogs (Golden Retriever, Labradoodle, and a small Terrier mix). The subjects are positioned centrally to ensure visibility on mobile screens, but with enough space around them to look spacious on desktop. Warm natural lighting, cozy and clean atmosphere. Pure photography, NO TEXT, NO UI, NO OVERLAYS.";

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response = result.response;
    // console.log(JSON.stringify(response, null, 2));

    if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const buffer = Buffer.from(part.inlineData.data, "base64");
                    const filename = "public/hero/landing-hero-v3.png";
                    writeFileSync(filename, buffer);
                    console.log(`Image saved to ${filename}`);
                    return;
                }
            }
        }
    }
    console.log("No image found in response.");
    
  } catch (error) {
    console.error("Error generating image:", error);
    if (error.response) {
       // console.error("Error details:", JSON.stringify(error.response, null, 2));
    }
  }
}

generateImage();
