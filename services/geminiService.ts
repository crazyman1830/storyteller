import { GoogleGenAI } from "@google/genai";
import { ALCHEMIST_SYSTEM_PROMPT } from "../constants";
import { NovelConfiguration } from "../types";

/**
 * Helper to create a standardized instruction line.
 * e.g., "- **Genre:** Fantasy" or "- **Genre:** Auto-detect / Best fit"
 */
const createInstruction = (label: string, value: string | null, defaultText: string = "Auto-detect / Best fit") => {
  return `- **${label}:** ${value ? value : defaultText}`;
};

/**
 * Generates the specific instruction for story length based on the selected option.
 */
const getLengthInstruction = (length: string | null): string => {
  if (!length) {
    return `- **Target Length:** Auto (Writer's discretion, usually 2,000+ characters)`;
  }

  switch (length) {
    case "Short":
      return `- **Target Length:** Short length (approx. 1,000 ~ 1,500 characters). Concise but impactful.`;
    case "Medium":
      return `- **Target Length:** Standard length (approx. 2,000 ~ 3,000 characters). Well-paced.`;
    case "Long":
      return `- **Target Length:** Long length (approx. 4,000+ characters). Richly detailed.`;
    case "Max":
      return `- **Target Length:** Maximum possible length (try to reach 8,000+ characters if possible within limits). Epic and sprawling.`;
    default:
      return `- **Target Length:** Standard length.`;
  }
};

/**
 * Generates the content instruction, handling empty input cases.
 */
const getContentInstruction = (content: string): string => {
  if (content.trim()) {
    return `- **Story Idea / Content:** ${content}`;
  }
  return `- **Story Idea / Content:** Creative Freedom (Invent a compelling story)`;
};

/**
 * Assembles the final user prompt from the configuration.
 */
const buildPrompt = (config: NovelConfiguration): string => {
  const instructions = [
    "Please write a literary piece based on the following configuration:\n",
    
    // 1. Structure & Format
    createInstruction("Format", config.format, "Default (Short Novel / Story)"),
    getLengthInstruction(config.length),

    // 2. Style & Tone
    createInstruction("Target Author Style", config.authorStyle, "Alchemist's Default (Sentimental & Verbose)"),
    createInstruction("Genre", config.genre),
    createInstruction("Theme", config.theme),
    
    // 3. Narrative Elements
    createInstruction("Ending Style", config.endingStyle),
    createInstruction("Point of View", config.pointOfView),

    // 4. Core Content
    getContentInstruction(config.content)
  ];
  
  return instructions.join("\n");
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