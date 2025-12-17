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
      return `- **Target Length:** Maximum possible length (try to reach 8,000+ characters if the story permits). Epic scale.`;
    default:
      return `- **Target Length:** Auto`;
  }
};

/**
 * Generates the full novel content stream.
 */
export const generateNovelStream = async function* (config: NovelConfiguration) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const userPrompt = `
<user_request>
Please write a story based on the following configuration:

1. **Core Idea / Content:**
${config.content}

2. **Story Specifications:**
${createInstruction('Genre', config.genre)}
${createInstruction('Format', config.format)}
${createInstruction('Ending Style', config.endingStyle)}
${createInstruction('Theme', config.theme)}
${createInstruction('Additional Story Config', config.customStoryConfig, "None")}
${getLengthInstruction(config.length)}

3. **Author Persona & Style:**
${createInstruction('Writing Style', config.authorStyle)}
${createInstruction('Point of View', config.pointOfView)}
${createInstruction('Emotional Tone', config.emotionalTone)}
${createInstruction('Narrative Pace', config.narrativePace)}
${createInstruction('Narrative Mode', config.narrativeMode)}
${createInstruction('Author Personality', config.authorPersonality)}
${createInstruction('Author Tone (Speech)', config.authorTone)}
${createInstruction('Additional Author Config', config.customAuthorConfig, "None")}
</user_request>
`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: ALCHEMIST_SYSTEM_PROMPT,
        temperature: 0.8, // Slightly creative
        topK: 40,
        topP: 0.95,
      }
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI 작가가 집필 도중 펜을 놓쳤습니다. 다시 시도해주세요.");
  }
};

/**
 * Generates a response to user feedback, maintaining chat history/context.
 */
export const generateFeedbackResponseStream = async function* (
  storyTitle: string,
  chatHistory: ChatMessage[],
  authorPersonality: string | null,
  authorTone: string | null
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Format the chat history into a transcript for the prompt
  const conversationLog = chatHistory.map(msg => {
    const speaker = msg.role === 'user' ? 'Reader' : 'Author';
    return `${speaker}: ${msg.text}`;
  }).join('\n');

  const feedbackSystemPrompt = `
You are the author of the story titled "${storyTitle}".
You are currently chatting with your reader.

**Your Persona:**
- **Personality:** ${authorPersonality || "Professional, appreciative, but slightly perfectionist"}
- **Tone:** ${authorTone || "Polite and thoughtful"}

**Instructions:**
1. Reply to the reader's latest message based on the conversation history.
2. Stay in character. If your persona is "Grumpy", be grumpy. If "Poetic", be poetic.
3. Keep your responses relatively concise (under 3 sentences) unless asked for a detailed explanation.
4. **Language:** Korean (한국어).
`;

  const userPrompt = `
<conversation_history>
${conversationLog}
</conversation_history>

Reply to the Reader as the Author:
`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: feedbackSystemPrompt,
        temperature: 0.7,
      }
    });

    for await (const chunk of response) {
        if (chunk.text) {
            yield chunk.text;
        }
    }
  } catch (error) {
    console.error("Feedback Generation Error:", error);
    yield "죄송합니다. 독자님의 말씀에 답하기가 어렵네요.";
  }
};