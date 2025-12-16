import React, { useRef, useEffect, useState } from 'react';
import LoadingIndicator from './components/LoadingIndicator';
import NovelRenderer from './components/NovelRenderer';
import { LoadingState } from './types';
import { useNovelGeneration } from './hooks/useNovelGeneration';

// Toggle Component
const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`group flex items-center gap-3 focus:outline-none transition-all duration-300 ${checked ? 'text-white' : 'text-gray-500'}`}
    role="switch"
    aria-checked={checked}
  >
    <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${checked ? 'bg-primary' : 'bg-white/10'}`}>
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
    <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
  </button>
);

// Segmented Control for Length
const LengthSelector: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const options = [
    { label: '짧은글', value: 'Short' },
    { label: '보통', value: 'Medium' },
    { label: '긴글', value: 'Long' },
    { label: '최대', value: 'Max' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 bg-white/5 p-1 rounded-lg">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
            value === opt.value
              ? 'bg-primary text-black shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const {
    content, setContent,
    useCustomFormat, setUseCustomFormat, format, setFormat,
    useCustomLength, setUseCustomLength, length, setLength,
    useCustomGenre, setUseCustomGenre, genre, setGenre,
    useCustomTheme, setUseCustomTheme, theme, setTheme,
    useCustomAuthor, setUseCustomAuthor, authorStyle, setAuthorStyle,
    useCustomEnding, setUseCustomEnding, endingStyle, setEndingStyle,
    useCustomPOV, setUseCustomPOV, pointOfView, setPointOfView,
    novelMarkdown,
    loadingState,
    errorMessage,
    generate,
    reset
  } = useNovelGeneration();

  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Scroll to result when generating starts
  useEffect(() => {
    if (loadingState === LoadingState.GENERATING && resultRef.current) {
       resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loadingState]);

  const isGenerating = loadingState === LoadingState.GENERATING;
  const isComplete = loadingState === LoadingState.COMPLETE;
  const hasResult = isGenerating || isComplete;

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden text-gray-200 font-sans selection:bg-primary/30">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-900/20 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-900/20 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
        <div className="absolute top-[20%] left-[50%] transform -translate-x-1/2 w-[60rem] h-[60rem] bg-primary/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col min-h-screen">
        
        {/* Header - Hides when generating to give focus to text */}
        {!hasResult && (
          <header className={`transition-all duration-700 ease-in-out flex flex-col items-center mb-12 animate-slide-up`}>
            <div className="mb-6 relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-purple-600 opacity-30 blur group-hover:opacity-60 transition duration-1000"></div>
              <div className="relative w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 tracking-tight text-center mb-4">
              문장의 연금술사
            </h1>
            <p className="text-gray-400 text-sm md:text-base font-medium tracking-wide text-center max-w-lg mx-auto leading-relaxed">
              원하는 재료를 선택하고, 연금술의 결과를 확인하세요.
            </p>
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex-grow w-full">
          
          {/* Input Interface */}
          {!hasResult && (
            <div className="w-full max-w-2xl mx-auto animate-slide-up space-y-6">
               <div className="glass-panel rounded-3xl p-1.5 shadow-2xl shadow-black/50">
                  <div className="bg-surface/80 backdrop-blur-xl rounded-[1.3rem] p-6 md:p-8 border border-white/5 relative overflow-hidden group">
                    
                    {/* Glowing effect background */}
                    <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-primary/5 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>

                    {/* Form Grid */}
                    <div className="space-y-6 relative z-10">
                      
                      {/* Main Content Input */}
                      <div className="space-y-3">
                        <label className="block text-primary text-xs font-bold tracking-widest uppercase ml-1">
                          이야기 내용 / 줄거리
                        </label>
                        <textarea
                          ref={textareaRef}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="어떤 이야기를 만들고 싶으신가요? 키워드, 줄거리, 혹은 막연한 느낌을 적어주세요."
                          className="w-full bg-transparent text-lg text-white placeholder-gray-600 border-none focus:ring-0 resize-none outline-none leading-relaxed min-h-[120px]"
                          rows={3}
                          autoFocus
                        />
                      </div>

                      <div className="h-px bg-white/5 w-full"></div>

                      {/* Advanced Settings Toggle */}
                      <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                      >
                         <svg className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                         </svg>
                         세부 설정 (형식, 분량, 스타일 등)
                      </button>

                      {/* Collapsible Advanced Settings */}
                      <div className={`grid gap-6 overflow-hidden transition-all duration-500 ease-in-out ${showAdvanced ? 'max-h-[1000px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                          
                          {/* Group 0: Format & Length */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* Format */}
                             <div className="space-y-2">
                                <div className="flex justify-between items-center h-8">
                                  <label className="text-gray-300 text-sm font-semibold">글의 형식</label>
                                  <ToggleSwitch checked={useCustomFormat} onChange={setUseCustomFormat} label={useCustomFormat ? "입력" : "자동"} />
                                </div>
                                {useCustomFormat ? (
                                  <input type="text" value={format} onChange={(e) => setFormat(e.target.value)} placeholder="예: 소설, 수필" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                                ) : <div className="h-[38px] w-full bg-white/5 border border-white/5 rounded-lg flex items-center px-3 text-sm text-gray-600 italic select-none">AI가 결정합니다</div>}
                             </div>

                             {/* Length */}
                             <div className="space-y-2">
                                <div className="flex justify-between items-center h-8">
                                  <label className="text-gray-300 text-sm font-semibold">글의 분량</label>
                                  <ToggleSwitch checked={useCustomLength} onChange={setUseCustomLength} label={useCustomLength ? "선택" : "자동"} />
                                </div>
                                {useCustomLength ? (
                                  <LengthSelector value={length} onChange={setLength} />
                                ) : <div className="h-[38px] w-full bg-white/5 border border-white/5 rounded-lg flex items-center px-3 text-sm text-gray-600 italic select-none">AI가 결정합니다</div>}
                             </div>
                          </div>

                          {/* Group 1: Style & Tone */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* Author Style */}
                             <div className="space-y-2">
                                <div className="flex justify-between items-center h-8">
                                  <label className="text-gray-300 text-sm font-semibold">작가 스타일</label>
                                  <ToggleSwitch checked={useCustomAuthor} onChange={setUseCustomAuthor} label={useCustomAuthor ? "입력" : "자동"} />
                                </div>
                                {useCustomAuthor ? (
                                  <input type="text" value={authorStyle} onChange={(e) => setAuthorStyle(e.target.value)} placeholder="예: 헤밍웨이" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                                ) : <div className="h-[38px] w-full bg-white/5 border border-white/5 rounded-lg flex items-center px-3 text-sm text-gray-600 italic select-none">AI가 결정합니다</div>}
                             </div>

                             {/* Genre */}
                             <div className="space-y-2">
                                <div className="flex justify-between items-center h-8">
                                  <label className="text-gray-300 text-sm font-semibold">장르</label>
                                  <ToggleSwitch checked={useCustomGenre} onChange={setUseCustomGenre} label={useCustomGenre ? "입력" : "자동"} />
                                </div>
                                {useCustomGenre ? (
                                  <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="예: 로맨스" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                                ) : <div className="h-[38px] w-full bg-white/5 border border-white/5 rounded-lg flex items-center px-3 text-sm text-gray-600 italic select-none">AI가 결정합니다</div>}
                             </div>
                          </div>

                          {/* Group 2: Narrative Structure */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* POV */}
                             <div className="space-y-2">
                                <div className="flex justify-between items-center h-8">
                                  <label className="text-gray-300 text-sm font-semibold">시점 (POV)</label>
                                  <ToggleSwitch checked={useCustomPOV} onChange={setUseCustomPOV} label={useCustomPOV ? "입력" : "자동"} />
                                </div>
                                {useCustomPOV ? (
                                  <input type="text" value={pointOfView} onChange={(e) => setPointOfView(e.target.value)} placeholder="예: 1인칭" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                                ) : <div className="h-[38px] w-full bg-white/5 border border-white/5 rounded-lg flex items-center px-3 text-sm text-gray-600 italic select-none">AI가 결정합니다</div>}
                             </div>

                             {/* Ending Style */}
                             <div className="space-y-2">
                                <div className="flex justify-between items-center h-8">
                                  <label className="text-gray-300 text-sm font-semibold">결말 스타일</label>
                                  <ToggleSwitch checked={useCustomEnding} onChange={setUseCustomEnding} label={useCustomEnding ? "입력" : "자동"} />
                                </div>
                                {useCustomEnding ? (
                                  <input type="text" value={endingStyle} onChange={(e) => setEndingStyle(e.target.value)} placeholder="예: 열린 결말" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                                ) : <div className="h-[38px] w-full bg-white/5 border border-white/5 rounded-lg flex items-center px-3 text-sm text-gray-600 italic select-none">AI가 결정합니다</div>}
                             </div>
                          </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-end items-center mt-8 pt-6 border-t border-white/5">
                      <button
                        onClick={generate}
                        className="relative px-8 py-3 bg-white text-black font-semibold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                      >
                        <span className="relative z-10 flex items-center gap-2 text-sm tracking-wide">
                          연성하기
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </span>
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* Error View */}
          {loadingState === LoadingState.ERROR && (
            <div className="max-w-lg mx-auto bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl p-8 text-center animate-fade-in mt-10">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">오류 발생</h3>
              <p className="text-gray-400 mb-6">{errorMessage}</p>
              <button 
                onClick={reset}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* Streaming & Result View */}
          {hasResult && (
            <div ref={resultRef} className="animate-fade-in pb-12 pt-8">
              
              {/* Floating Header during generation */}
              <div className="flex items-center justify-center mb-10 gap-3">
                 {isGenerating ? (
                   <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                      <span className="text-xs font-bold text-primary tracking-widest uppercase">집필 중...</span>
                   </div>
                 ) : (
                   <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                     <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   </div>
                 )}
              </div>

              <NovelRenderer rawMarkdown={novelMarkdown} isStreaming={isGenerating} />
              
              {/* Footer Actions (Only show when complete) */}
              {isComplete && (
                <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-20 animate-slide-up">
                   <button
                      onClick={reset}
                      className="pointer-events-auto px-6 py-3 bg-surface/90 backdrop-blur-md text-gray-300 hover:text-white border border-white/10 hover:border-white/30 rounded-full shadow-lg transition-all hover:-translate-y-1 font-medium text-sm flex items-center gap-2 group"
                   >
                     <svg className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     새로운 영감 찾기
                   </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;