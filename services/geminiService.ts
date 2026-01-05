
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getAIDiagnosis(issue: string, product: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional technical support engineer. 
      Analyze the following customer issue and provide a concise diagnostic suggestion and recommended next steps in Korean.
      Product: ${product}
      Issue: ${issue}
      
      Format the response with:
      1. Possible Cause
      2. Recommended Action
      Keep it professional and helpful.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 500,
      }
    });

    return response.text || "AI 분석 결과를 가져올 수 없습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}
