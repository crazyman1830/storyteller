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
  format: string | null; // New: Novel, Essay, Web Novel, etc.
  length: string | null; // New: Short, Medium, Long, Max
  content: string; // The core idea
}

export interface NovelTemplate {
  id: string;
  label: string;
  description: string;
  icon: string;
  config: Partial<NovelConfiguration>;
}

export interface GenerationError {
  message: string;
}