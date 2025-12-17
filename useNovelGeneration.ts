import { useState, useCallback } from 'react';
import { generateNovelStream } from '../services/geminiService';
import { NovelConfiguration, LoadingState } from '../types';

export const useNovelGeneration = () => {
  // Configuration State
  const [content, setContent] = useState<string>('');
  
  const [useCustomFormat, setUseCustomFormat] = useState<boolean>(false);
  const [format, setFormat] = useState<string>('');

  const [useCustomLength, setUseCustomLength] = useState<boolean>(false);
  const [length, setLength] = useState<string>('Medium');

  const [useCustomGenre, setUseCustomGenre] = useState<boolean>(false);
  const [genre, setGenre] = useState<string>('');
  
  const [useCustomTheme, setUseCustomTheme] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>('');
  
  const [useCustomAuthor, setUseCustomAuthor] = useState<boolean>(false);
  const [authorStyle, setAuthorStyle] = useState<string>('');

  const [useCustomEnding, setUseCustomEnding] = useState<boolean>(false);
  const [endingStyle, setEndingStyle] = useState<string>('');

  const [useCustomPOV, setUseCustomPOV] = useState<boolean>(false);
  const [pointOfView, setPointOfView] = useState<string>('');

  // Generation State
  const [novelMarkdown, setNovelMarkdown] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoadingState(LoadingState.GENERATING);
    setErrorMessage(null);
    setNovelMarkdown('');

    const config: NovelConfiguration = {
      content,
      format: useCustomFormat && format.trim() ? format : null,
      length: useCustomLength ? length : null,
      genre: useCustomGenre && genre.trim() ? genre : null,
      theme: useCustomTheme && theme.trim() ? theme : null,
      authorStyle: useCustomAuthor && authorStyle.trim() ? authorStyle : null,
      endingStyle: useCustomEnding && endingStyle.trim() ? endingStyle : null,
      pointOfView: useCustomPOV && pointOfView.trim() ? pointOfView : null,
      emotionalTone: null,
      narrativePace: null,
      narrativeMode: null,
      authorPersonality: null,
      authorTone: null,
      customStoryConfig: null,
      customAuthorConfig: null
    };

    try {
      const stream = generateNovelStream(config);
      
      for await (const chunk of stream) {
        setNovelMarkdown((prev) => prev + chunk);
      }
      
      setLoadingState(LoadingState.COMPLETE);
    } catch (err: any) {
      setLoadingState(LoadingState.ERROR);
      setErrorMessage(err.message || '연금술 과정에서 알 수 없는 오류가 발생했습니다.');
    }
  }, [
    content, useCustomFormat, format, useCustomLength, length, 
    useCustomGenre, genre, useCustomTheme, theme, 
    useCustomAuthor, authorStyle, useCustomEnding, endingStyle, 
    useCustomPOV, pointOfView
  ]);

  const reset = useCallback(() => {
    setLoadingState(LoadingState.IDLE);
    setNovelMarkdown('');
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    // Config State
    content, setContent,
    useCustomFormat, setUseCustomFormat, format, setFormat,
    useCustomLength, setUseCustomLength, length, setLength,
    useCustomGenre, setUseCustomGenre, genre, setGenre,
    useCustomTheme, setUseCustomTheme, theme, setTheme,
    useCustomAuthor, setUseCustomAuthor, authorStyle, setAuthorStyle,
    useCustomEnding, setUseCustomEnding, endingStyle, setEndingStyle,
    useCustomPOV, setUseCustomPOV, pointOfView, setPointOfView,
    
    // Result State
    novelMarkdown,
    loadingState,
    errorMessage,
    
    // Actions
    generate,
    reset
  };
};