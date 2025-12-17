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

/**
 * Generates a response from the author persona based on user feedback.
 */
export const generateFeedbackResponseStream = async function* (storyTitle: string, feedback: string) {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const feedbackPrompt = `
    The reader has finished reading your story titled "${storyTitle}".
    They have left the following feedback/comment for you:
    "${feedback}"

    Please respond to this reader.
    
    **Constraints:**
    1. **Persona:** You are the "Alchemist of Sentences". Maintain your signature style: deeply sentimental, poetic, humble yet proud of your craft, and slightly verbose.
    2. **Tone:** Be polite, grateful, or deeply moved depending on the feedback. If the feedback is critical, accept it with melancholic grace.
    3. **Language:** Korean (한국어).
    4. **Length:** A short paragraph (approx. 3-5 sentences).
    5. **Format:** Do not use markdown headers. Just the spoken response.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash', // Faster model for chat interaction
      contents: [{ role: 'user', parts: [{ text: feedbackPrompt }] }],
      config: {
        temperature: 0.8,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) yield text;
    }
  } catch (error: any) {
    console.error("Feedback Generation Error:", error);
    throw new Error("작가가 답장을 쓰는 도중 잉크가 번졌습니다.");
  }
};