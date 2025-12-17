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
  return `- **Story Idea / Content:** Creative Freedom (Invent a compelling story based on the genre)`;
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
    
    // Custom Story Config (Free Input)
    config.customStoryConfig ? `- **Additional Story Requirements:** ${config.customStoryConfig}` : '',

    // 2. Style & Tone
    createInstruction("Target Author Style", config.authorStyle, "Professional Novelist Style"),
    createInstruction("Emotional Tone", config.emotionalTone, "Balanced"),
    createInstruction("Narrative Pace", config.narrativePace, "Appropriate to genre"),
    createInstruction("Narrative Mode", config.narrativeMode, "Balanced mix of dialogue and narration"),
    
    // 3. Author Persona (Deep)
    createInstruction("Author's Personality", config.authorPersonality, "Professional, Objective"),
    createInstruction("Author's Voice/Speech", config.authorTone, "Polite, Formal"),
    
    // Custom Author Config (Free Input)
    config.customAuthorConfig ? `- **Additional Author Instructions:** ${config.customAuthorConfig}` : '',

    createInstruction("Genre", config.genre),
    createInstruction("Theme", config.theme),
    
    // 4. Narrative Elements
    createInstruction("Ending Style", config.endingStyle),
    createInstruction("Point of View", config.pointOfView),

    // 5. Core Content
    getContentInstruction(config.content)
  ];
  
  // Filter out empty strings from optional custom configs
  return instructions.filter(line => line !== '').join("\n");
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
      contents: userPrompt,
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
    throw new Error(error.message || "집필 과정에서 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
};

/**
 * Generates a response from the author persona based on user feedback.
 */
export const generateFeedbackResponseStream = async function* (
  storyTitle: string, 
  feedback: string,
  authorPersonality: string | null,
  authorTone: string | null
) {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Fallback defaults if not set
  const personality = authorPersonality || "Professional, Polite, Appreciative";
  const tone = authorTone || "Polite Korean (존댓말), Formal";

  const feedbackPrompt = `
    The reader has finished reading your story titled "${storyTitle}".
    They have left the following feedback/comment for you:
    "${feedback}"

    Please respond to this reader.
    
    **Constraints:**
    1. **Persona:** You are the author of this story. Adopt the following personality: **${personality}**.
    2. **Tone:** Speak in this specific tone/speech style: **${tone}**.
    3. **Language:** Korean (한국어).
    4. **Length:** A short, natural paragraph (approx. 2-4 sentences).
    5. **Style:** Do NOT use metaphors about magic, potions, or alchemy. Respond as a writer to a reader. If your personality is cynical, be cynical. If it's warm, be warm.
    6. **Format:** Text only. No markdown headers.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash', // Faster model for chat interaction
      contents: feedbackPrompt,
      config: {
        temperature: 0.8, // Slightly higher creativity for persona
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) yield text;
    }
  } catch (error: any) {
    console.error("Feedback Generation Error:", error);
    throw new Error("답장을 작성하는 중 오류가 발생했습니다.");
  }
};