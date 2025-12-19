import { GoogleGenAI } from "@google/genai";
import { ALCHEMIST_SYSTEM_PROMPT } from "../constants";
import { NovelConfiguration, ChatMessage } from "../types";

/**
 * Helper to create a standardized instruction line.
 */
const createInstruction = (label: string, value: string | null, defaultText: string = "Auto-detect / Best fit") => {
  return `- **${label}:** ${value ? value : defaultText}`;
};

/**
 * Generates the specific instruction for story length based on the selected option.
 */
const getLengthInstruction = (length: string | null): string => {
  if (!length) {
    return `- **Target Length:** Auto (Writer's discretion)`;
  }
  switch (length) {
    case "Short": return `- **Target Length:** Short length (1,000 ~ 1,500 characters).`;
    case "Medium": return `- **Target Length:** Standard length (2,000 ~ 3,000 characters).`;
    case "Long": return `- **Target Length:** Long length (4,000+ characters).`;
    case "Max": return `- **Target Length:** Maximum possible length (8,000+ characters).`;
    default: return `- **Target Length:** Auto`;
  }
};

/**
 * Generates the full novel content stream using Gemini 3 Pro with Thinking.
 */
export const generateNovelStream = async function* (config: NovelConfiguration) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const userPrompt = `
<user_request>
Please write a masterpiece based on the following configuration:
1. **Core Idea:** ${config.content}
2. **Story Specs:**
${createInstruction('Genre', config.genre)}
${createInstruction('Format', config.format)}
${createInstruction('Ending', config.endingStyle)}
${getLengthInstruction(config.length)}
3. **Author Persona:**
${createInstruction('Style', config.authorStyle)}
${createInstruction('POV', config.pointOfView)}
${createInstruction('Personality', config.authorPersonality)}
</user_request>
`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: userPrompt,
      config: {
        systemInstruction: ALCHEMIST_SYSTEM_PROMPT,
        temperature: 0.9,
        thinkingConfig: { thinkingBudget: 16384 },
      }
    });

    for await (const chunk of response) {
      if (chunk.text) yield chunk.text;
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI 작가가 깊은 고뇌 끝에 펜을 놓쳤습니다. 다시 시도해 주세요.");
  }
};

/**
 * Generates a response to user feedback.
 * Uses Thinking to ensure the author DOES NOT confuse the reader with a character.
 */
export const generateFeedbackResponseStream = async function* (
  storyTitle: string,
  storyContent: string,
  chatHistory: ChatMessage[],
  authorPersonality: string | null,
  authorTone: string | null
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const conversationLog = chatHistory.map(msg => {
    const speaker = msg.role === 'user' ? 'Reader' : 'Author';
    return `${speaker}: ${msg.text}`;
  }).join('\n');

  const feedbackSystemPrompt = `
You are the professional author of "${storyTitle}".
Current Partner: A real human "Reader" who exists outside your story.

**[ABSOLUTE RULES]**
1. **NO CHARACTER CONFUSION:** The Reader is NOT in your book. Do not treat them as a protagonist or any character. 
2. **METADATA AWARENESS:** If the reader asks questions about "me" or "my actions" in the context of the story, understand they are talking about the protagonist, not themselves as a person.
3. **SOURCE TRUTH:** Only use details from the provided story content.
4. **THINK BEFORE SPEAKING:** Use your thinking budget to verify your role: "I am the Author. The person I'm talking to is the Reader. We are outside the story."

**[Story Context]**
${storyContent}

**[Your Persona]**
- Personality: ${authorPersonality || "Professional"}
- Tone: ${authorTone || "Polite"}

**[Language]** Korean only. 2-4 sentences.
`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: `Conversation History:\n${conversationLog}\n\nAuthor, please reply to the Reader:`,
      config: {
        systemInstruction: feedbackSystemPrompt,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 4096 },
      }
    });

    for await (const chunk of response) {
      if (chunk.text) yield chunk.text;
    }
  } catch (error) {
    console.error("Feedback Error:", error);
    yield "죄송합니다. 독자님의 말씀에 잠시 생각이 멈췄네요.";
  }
};
