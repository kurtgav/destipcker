import { GoogleGenerativeAI } from "@google/generative-ai";
import { Buffer } from "buffer";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) console.warn("Gemini: API Key NOT FOUND in env");
else console.log("Gemini: API Key found");

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

// Helper to convert file/blob to inline data part
export async function fileToGenerativePart(file: Blob) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType: file.type,
        },
    };
}
