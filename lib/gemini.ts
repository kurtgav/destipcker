import { GoogleGenerativeAI } from "@google/generative-ai";
import { Buffer } from "buffer";

export const getGeminiModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.includes('placeholder')) {
        console.warn("Gemini: API Key NOT FOUND or placeholder in env");
        return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};

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
