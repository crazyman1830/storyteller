import { useReducer, useCallback, useEffect } from 'react';
import { generateNovelStream } from '../services/geminiService';
import { NovelConfiguration, LoadingState, StoryTemplate, AuthorTemplate } from '../types';

const STORAGE_KEY = 'ai-novel-studio-v1';

// --- State Definitions ---

interface ConfigState {
  content: string;
  format: string;
  length: string;
  genre: string;
  theme: string;
  authorStyle: string;
  endingStyle: string;
  pointOfView: string;
  emotionalTone: string;
  narrativePace: string;
  narrativeMode: string;
  authorPersonality: string;
  authorTone: string;
  customStoryConfig: string;
  customAuthorConfig: string;
}

interface TogglesState {
  useCustomFormat: boolean;
  useCustomLength: boolean;
  useCustomGenre: boolean;
  useCustomTheme: boolean;
  useCustomAuthor: boolean;
  useCustomEnding: boolean;
  useCustomPOV: boolean;
  useCustomTone: boolean;
  useCustomPace: boolean;
  useCustomMode: boolean;
  useCustomPersonality: boolean;
  useCustomSpeech: boolean;
  useCustomStoryConfig: boolean;
  useCustomAuthorConfig: boolean;
}

interface GenerationState {
  config: ConfigState;
  toggles: TogglesState;
  selection: {
    storyTemplateId: string;
    authorTemplateId: string;
  };
  result: {
    markdown: string;
    loadingState: LoadingState;
    errorMessage: string | null;
  };
}

// --- Initial State Defaults ---

const getInitialConfig = (): ConfigState => ({
  content: '',
  format: '',
  length: 'Medium',
  genre: '',
  theme: '',
  authorStyle: '',
  endingStyle: '',
  pointOfView: '',
  emotionalTone: '',
  narrativePace: '',
  narrativeMode: '',
  authorPersonality: '',
  authorTone: '',
  customStoryConfig: '',
  customAuthorConfig: '',
});

const getInitialToggles = (): TogglesState => ({
  useCustomFormat: false,
  useCustomLength: false,
  useCustomGenre: false,
  useCustomTheme: false,
  useCustomAuthor: false,
  useCustomEnding: false,
  useCustomPOV: false,
  useCustomTone: false,
  useCustomPace: false,
  useCustomMode: false,
  useCustomPersonality: false,
  useCustomSpeech: false,
  useCustomStoryConfig: false,
  useCustomAuthorConfig: false,
});

const getDefaultState = (): GenerationState => ({
  config: getInitialConfig(),
  toggles: getInitialToggles(),
  selection: {
    storyTemplateId: '',
    authorTemplateId: '',
  },
  result: {
    markdown: '',
    loadingState: LoadingState.IDLE,
    errorMessage: null,
  },
});

// --- LocalStorage Helper ---
const loadStateFromStorage = (): GenerationState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure loading state is reset to idle or complete on reload to prevent stuck spinners
      if (parsed.result.loadingState === LoadingState.GENERATING) {
        parsed.result.loadingState = parsed.result.markdown ? LoadingState.COMPLETE : LoadingState.IDLE;
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load state from storage', e);
  }
  return getDefaultState();
};

// --- Reducer ---

type Action =
  | { type: 'SET_FIELD'; field: keyof ConfigState; value: string }
  | { type: 'TOGGLE_FIELD'; field: keyof TogglesState }
  | { type: 'SET_TOGGLE'; field: keyof TogglesState; value: boolean }
  | { type: 'APPLY_STORY_TEMPLATE'; template: StoryTemplate }
  | { type: 'APPLY_AUTHOR_TEMPLATE'; template: AuthorTemplate }
  | { type: 'START_GENERATION' }
  | { type: 'APPEND_GENERATION'; chunk: string }
  | { type: 'COMPLETE_GENERATION' }
  | { type: 'ERROR_GENERATION'; message: string }
  | { type: 'RESET' };

function reducer(state: GenerationState, action: Action): GenerationState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        config: { ...state.config, [action.field]: action.value },
      };
    case 'TOGGLE_FIELD':
      return {
        ...state,
        toggles: { ...state.toggles, [action.field]: !state.toggles[action.field] },
      };
    case 'SET_TOGGLE':
      return {
        ...state,
        toggles: { ...state.toggles, [action.field]: action.value },
      };
    case 'APPLY_STORY_TEMPLATE': {
      const { config } = action.template;
      const newContent = (config.contentSuggestion && !state.config.content) 
        ? config.contentSuggestion 
        : state.config.content;

      return {
        ...state,
        config: {
          ...state.config,
          content: newContent,
          format: config.format,
          genre: config.genre,
          endingStyle: config.endingStyle,
          length: config.length || 'Medium',
        },
        toggles: {
          ...state.toggles,
          useCustomFormat: !!config.format,
          useCustomGenre: !!config.genre,
          useCustomEnding: !!config.endingStyle,
          useCustomLength: !!config.length,
        },
        selection: {
          ...state.selection,
          storyTemplateId: action.template.id,
        }
      };
    }
    case 'APPLY_AUTHOR_TEMPLATE': {
      const { config } = action.template;
      return {
        ...state,
        config: {
          ...state.config,
          authorStyle: config.authorStyle,
          pointOfView: config.pointOfView,
          theme: config.theme,
          emotionalTone: config.emotionalTone || '',
          narrativePace: config.narrativePace || '',
          narrativeMode: config.narrativeMode || '',
          authorPersonality: config.authorPersonality || '',
          authorTone: config.authorTone || '',
        },
        toggles: {
          ...state.toggles,
          useCustomAuthor: !!config.authorStyle,
          useCustomPOV: !!config.pointOfView,
          useCustomTheme: !!config.theme,
          useCustomTone: !!config.emotionalTone,
          useCustomPace: !!config.narrativePace,
          useCustomMode: !!config.narrativeMode,
          useCustomPersonality: !!config.authorPersonality,
          useCustomSpeech: !!config.authorTone,
        },
        selection: {
          ...state.selection,
          authorTemplateId: action.template.id,
        }
      };
    }
    case 'START_GENERATION':
      return {
        ...state,
        result: {
          markdown: '',
          loadingState: LoadingState.GENERATING,
          errorMessage: null,
        },
      };
    case 'APPEND_GENERATION':
      return {
        ...state,
        result: {
          ...state.result,
          markdown: state.result.markdown + action.chunk,
        },
      };
    case 'COMPLETE_GENERATION':
      return {
        ...state,
        result: {
          ...state.result,
          loadingState: LoadingState.COMPLETE,
        },
      };
    case 'ERROR_GENERATION':
      return {
        ...state,
        result: {
          ...state.result,
          loadingState: LoadingState.ERROR,
          errorMessage: action.message,
        },
      };
    case 'RESET':
      // Return a fresh default state to ensure everything is cleared
      return getDefaultState();
    default:
      return state;
  }
}

// --- Hook ---

export const useNovelGeneration = () => {
  // Initialize with persisted state if available
  const [state, dispatch] = useReducer(reducer, null, loadStateFromStorage);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateConfig = useCallback((field: keyof ConfigState, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const toggleConfig = useCallback((field: keyof TogglesState) => {
    dispatch({ type: 'TOGGLE_FIELD', field });
  }, []);
  
  const setToggle = useCallback((field: keyof TogglesState, value: boolean) => {
    dispatch({ type: 'SET_TOGGLE', field, value });
  }, []);

  const applyStoryTemplate = useCallback((template: StoryTemplate) => {
    dispatch({ type: 'APPLY_STORY_TEMPLATE', template });
  }, []);

  const applyAuthorTemplate = useCallback((template: AuthorTemplate) => {
    dispatch({ type: 'APPLY_AUTHOR_TEMPLATE', template });
  }, []);

  const reset = useCallback(() => {
    // Removed window.confirm for better UX and reliability
    dispatch({ type: 'RESET' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const generate = useCallback(async () => {
    dispatch({ type: 'START_GENERATION' });
    
    const { config, toggles } = state;

    // Helper to conditionally get value
    const val = (toggle: boolean, value: string) => (toggle && value.trim() ? value : null);

    const apiConfig: NovelConfiguration = {
      content: config.content,
      format: val(toggles.useCustomFormat, config.format),
      length: toggles.useCustomLength ? config.length : null,
      genre: val(toggles.useCustomGenre, config.genre),
      theme: val(toggles.useCustomTheme, config.theme),
      authorStyle: val(toggles.useCustomAuthor, config.authorStyle),
      endingStyle: val(toggles.useCustomEnding, config.endingStyle),
      pointOfView: val(toggles.useCustomPOV, config.pointOfView),
      emotionalTone: val(toggles.useCustomTone, config.emotionalTone),
      narrativePace: val(toggles.useCustomPace, config.narrativePace),
      narrativeMode: val(toggles.useCustomMode, config.narrativeMode),
      authorPersonality: val(toggles.useCustomPersonality, config.authorPersonality),
      authorTone: val(toggles.useCustomSpeech, config.authorTone),
      customStoryConfig: val(toggles.useCustomStoryConfig, config.customStoryConfig),
      customAuthorConfig: val(toggles.useCustomAuthorConfig, config.customAuthorConfig),
    };

    try {
      const stream = generateNovelStream(apiConfig);
      for await (const chunk of stream) {
        dispatch({ type: 'APPEND_GENERATION', chunk });
      }
      dispatch({ type: 'COMPLETE_GENERATION' });
    } catch (err: any) {
      dispatch({ type: 'ERROR_GENERATION', message: err.message || '작업 중 알 수 없는 오류가 발생했습니다.' });
    }
  }, [state]);

  return {
    state,
    actions: {
      updateConfig,
      toggleConfig,
      setToggle,
      applyStoryTemplate,
      applyAuthorTemplate,
      reset,
      generate
    }
  };
};