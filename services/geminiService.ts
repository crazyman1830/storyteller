import { GoogleGenAI } from "@google/genai";
import { ALCHEMIST_SYSTEM_PROMPT } from "../constants";
import { NovelConfiguration } from "../types";

// Helper to build the prompt string
const buildPrompt = (config: NovelConfiguration): string => {
  const promptParts = [];
  promptParts.push("Please write a literary piece based on the following configuration:\n");
  
  // 1. Format
  promptParts.push(config.format ? `- **Format:** ${config.format}` : `- **Format:** Default (Short Novel / Story)`);

  // 2. Length
  if (config.length) {
    let lengthInstruction = "";
    switch (config.length) {
      case "Short": lengthInstruction = "Short length (approx. 1,000 ~ 1,500 characters). Concise but impactful."; break;
      case "Medium": lengthInstruction = "Standard length (approx. 2,000 ~ 3,000 characters). Well-paced."; break;
      case "Long": lengthInstruction = "Long length (approx. 4,000+ characters). Richly detailed."; break;
      case "Max": lengthInstruction = "Maximum possible length (try to reach 8,000+ characters if possible within limits). Epic and sprawling."; break;
      default: lengthInstruction = "Standard length.";
    }
    promptParts.push(`- **Target Length:** ${lengthInstruction}`);
  } else {
    promptParts.push(`- **Target Length:** Auto (Writer's discretion, usually 2,000+ characters)`);
  }

  promptParts.push(config.authorStyle ? `- **Target Author Style:** ${config.authorStyle}` : `- **Target Author Style:** Alchemist's Default (Sentimental & Verbose)`);
  promptParts.push(config.genre ? `- **Genre:** ${config.genre}` : `- **Genre:** Auto-detect / Best fit`);
  promptParts.push(config.theme ? `- **Theme:** ${config.theme}` : `- **Theme:** Auto-detect / Best fit`);
  promptParts.push(config.endingStyle ? `- **Ending Style:** ${config.endingStyle}` : `- **Ending Style:** Auto-detect / Best fit`);
  promptParts.push(config.pointOfView ? `- **Point of View:** ${config.pointOfView}` : `- **Point of View:** Auto-detect / Best fit`);

  if (config.content.trim()) {
    promptParts.push(`- **Story Idea / Content:** ${config.content}`);
  } else {
    promptParts.push(`- **Story Idea / Content:** Creative Freedom (Invent a compelling story)`);
  }
  
  return promptParts.join("\n");
};

export const generateNovelStream = async function* (config: NovelConfiguration) {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing in the environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const userPrompt = buildPrompt(config);

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      config: {
        systemInstruction: ALCHEMIST_SYSTEM_PROMPT,
        temperature: 0.9,
        maxOutputTokens: 8192,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "연금술 과정에서 알 수 없는 방해를 받았습니다.");
  }
};