export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface NovelContent {
  title: string;
  body: string;
  meta: {
    genre: string;
    intent: string;
  };
}

export interface NovelConfiguration {
  authorStyle: string | null; // null implies Auto
  genre: string | null;
  theme: string | null;
  endingStyle: string | null;
  pointOfView: string | null;
  format: string | null;
  length: string | null;
  content: string;
  
  // New Persona Options
  emotionalTone: string | null; // e.g. Cynical, Warm, Melancholic
  narrativePace: string | null; // e.g. Fast-paced, Slow-burn
  narrativeMode: string | null; // e.g. Dialogue-heavy, Descriptive, Inner Monologue
  authorPersonality: string | null; // e.g. Perfectionist, Lazy genius, Grumpy
  authorTone: string | null; // e.g. Polite, Slang-heavy, Archaic

  // Free Input Fields
  customStoryConfig: string | null; // Additional story instructions
  customAuthorConfig: string | null; // Additional author persona instructions
}

export interface BaseTemplate {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface StoryTemplate extends BaseTemplate {
  config: {
    format: string;
    genre: string;
    endingStyle: string;
    length: string;
    contentSuggestion?: string;
  };
}

export interface AuthorTemplate extends BaseTemplate {
  config: {
    authorStyle: string;
    pointOfView: string;
    theme: string;
    // Optional in template, but good to have
    emotionalTone?: string;
    narrativePace?: string;
    narrativeMode?: string;
    authorPersonality?: string;
    authorTone?: string;
  };
}

export interface GenerationError {
  message: string;
}