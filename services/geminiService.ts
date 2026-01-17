
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMoodWithContext = async (input: string, sentimentLabel?: string): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The student said: "${input}". 
    The preliminary sentiment analysis detected a "${sentimentLabel || 'Neutral'}" tone.
    
    1. Determine their primary mood from: [Happy, Stressed, Anxious, Sad, Neutral, Calm].
    2. Provide a supportive explanation based on the input and sentiment.
    3. Suggest 3 real songs (Artist - Title) that act as therapeutic counterparts to this specific mood.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mood: { type: Type.STRING },
          explanation: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
              },
              required: ['title', 'artist']
            }
          }
        },
        required: ['mood', 'explanation', 'recommendations']
      }
    }
  });

  try {
    const text = response.text.trim();
    const jsonStr = text.startsWith('```json') ? text.replace(/```json|```/g, '') : text;
    return JSON.parse(jsonStr) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {
      mood: 'Neutral',
      explanation: "I'm here for you.",
      recommendations: [{ title: "Weightless", artist: "Marconi Union" }]
    };
  }
};
