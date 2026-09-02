import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
let aiInstance: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI:', err);
  }
}

export function getAiInstance(): GoogleGenAI | null {
  return aiInstance;
}

export function isGeminiConfigured(): boolean {
  return !!aiInstance;
}
