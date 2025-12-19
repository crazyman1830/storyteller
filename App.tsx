
import React, { useRef, useEffect, useState } from 'react';
import NovelRenderer from './components/NovelRenderer';
import TemplateSelector from './components/TemplateSelector';
import { ToggleSwitch, LengthSelector, SettingInput } from './components/InputComponents';
import { STORY_TEMPLATES, AUTHOR_TEMPLATES } from './constants';
import { LoadingState } from './types';
import { useNovelGeneration } from './hooks/useNovelGeneration';

const App: React.FC = () => {
  const { state, actions } = useNovelGeneration();
  const { config, toggles, selection, result } = state;
  const { loadingState, errorMessage, markdown } = result;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // 텍스트 영역 자동 높이 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [config.content]);

  // 집필 시작 시 결과 영역으로 스크롤
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
      
      {/* 배경 그라디언트 */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-900/20 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-900/20 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
        <div className="absolute top-[20%] left-[50%] transform -translate-x-1/2 w-[60rem] h-[60rem] bg-primary/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col min-h-screen">
        
        {/* 헤더 */}
        {!hasResult && (
          <header className="flex flex-col items-center mb-12 animate-slide-up">
            <div className="mb-6 relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-purple-600 opacity-30 blur group-hover:opacity-60 transition duration-1000"></div>
              <div className="relative w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 tracking-tight text-center mb-4">
              AI 스토리 스튜디오
            </h1>
            <p className="text-gray-400 text-sm md:text-base font-medium tracking-wide text-center max-w-lg mx-auto leading-relaxed">
              당신의 아이디어에 전문적인 문장력을 더해<br className="hidden md:block" />완성도 높은 이야기를 집필해드립니다.
            </p>
          </header>
        )}

        {/* 메인 콘텐츠 */}
        <main className="flex-grow w-full">
          
          {/* 입력 인터페이스 */}
          {!hasResult && (
            <div className="w-full max-w-2xl mx-auto animate-slide-up space-y-6">
               <div className="glass-panel rounded-3xl p-1.5 shadow-2xl shadow-black/50">
                  <div className="bg-surface/80 backdrop-blur-xl rounded-[1.3rem] p-6 md:p-8 border border-white/5 relative overflow-hidden group">
                    <div className="space-y-6 relative z-10">
                      
                      {/* 템플릿 선택기 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <TemplateSelector 
                           title="작품 템플릿 (Story)"
                           templates={STORY_TEMPLATES} 
                           onSelect={(t) => actions.applyStoryTemplate(t)}
                           selectedId={selection.storyTemplateId}
                           placeholder="장르 및 형식 선택"
                         />
                         <TemplateSelector 
                           title="작가 템플릿 (Author)"
                           templates={AUTHOR_TEMPLATES} 
                           onSelect={(t) => actions.applyAuthorTemplate(t)}
                           selectedId={selection.authorTemplateId}
                           placeholder="문체 및 페르소나 선택"
                         />
                      </div>

                      {/* 핵심 내용 입력 */}
                      <div className="space-y-3">
                        <label className="block text-primary text-xs font-bold tracking-widest uppercase ml-1">
                          이야기 소재 / 핵심 내용
                        </label>
                        <textarea
                          ref={textareaRef}
                          value={config.content}
                          onChange={(e) => actions.updateConfig('content', e.target.value)}
                          placeholder="어떤 이야기를 쓰고 싶으신가요? 핵심 소재, 줄거리, 혹은 떠오르는 장면을 자유롭게 적어주세요."
                          className="w-full bg-transparent text-lg text-white placeholder-gray-600 border-none focus:ring-0 resize-none outline-none leading-relaxed min-h-[120px]"
                          rows={3}
                        />
                      </div>

                      <div className="h-px bg-white/5 w-full my-6"></div>

                      {/* 세부 설정 토글 */}
                      <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 border ${showAdvanced ? 'bg-white/5 border-primary/30 text-primary shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200 hover:border-white/20'}`}
                      >
                         <span className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                           </svg>
                           세부 설정 조정
                         </span>
                         <div className={`p-1 rounded-full bg-white/5 transition-transform duration-300 ${showAdvanced ? 'rotate-180 bg-primary/20 text-primary' : ''}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" /></svg>
                         </div>
                      </button>

                      {/* 세부 설정 영역 */}
                      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showAdvanced ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="pt-6 pb-2 space-y-8">
                             <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">작품 세부 설정</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <SettingInput label="장르" isActive={toggles.useCustomGenre} onToggle={() => actions.toggleConfig('useCustomGenre')} value={config.genre} onChange={(v) => actions.updateConfig('genre', v)} placeholder="예: 스릴러, 판타지" />
                                  <SettingInput label="형식" isActive={toggles.useCustomFormat} onToggle={() => actions.toggleConfig('useCustomFormat')} value={config.format} onChange={(v) => actions.updateConfig('format', v)} placeholder="예: 단편소설, 시나리오" />
                                  <div className={`p-4 rounded-xl border transition-all duration-300 ${toggles.useCustomLength ? 'bg-white/5 border-primary/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'}`}>
                                      <div className="flex justify-between items-center h-8 mb-2">
                                        <label className={`text-sm font-semibold transition-colors ${toggles.useCustomLength ? 'text-white' : 'text-gray-400'}`}>글의 분량</label>
                                        <ToggleSwitch checked={toggles.useCustomLength} onChange={() => actions.toggleConfig('useCustomLength')} label={toggles.useCustomLength ? "선택" : "자동"} />
                                      </div>
                                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${toggles.useCustomLength ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
                                          <LengthSelector value={config.length} onChange={(v) => actions.updateConfig('length', v)} />
                                      </div>
                                  </div>
                                  <SettingInput label="결말 방향" isActive={toggles.useCustomEnding} onToggle={() => actions.toggleConfig('useCustomEnding')} value={config.endingStyle} onChange={(v) => actions.updateConfig('endingStyle', v)} placeholder="예: 반전 결말, 해피엔딩" />
                                </div>
                             </div>

                             <div className="border-t border-white/5"></div>

                             <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">작가 페르소나 설정</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <SettingInput label="문체 스타일" isActive={toggles.useCustomAuthor} onToggle={() => actions.toggleConfig('useCustomAuthor')} value={config.authorStyle} onChange={(v) => actions.updateConfig('authorStyle', v)} placeholder="예: 건조한, 감성적인" />
                                  <SettingInput label="시점 (POV)" isActive={toggles.useCustomPOV} onToggle={() => actions.toggleConfig('useCustomPOV')} value={config.pointOfView} onChange={(v) => actions.updateConfig('pointOfView', v)} placeholder="예: 1인칭 주인공" />
                                  <SettingInput label="작가의 성격" isActive={toggles.useCustomPersonality} onToggle={() => actions.toggleConfig('useCustomPersonality')} value={config.authorPersonality} onChange={(v) => actions.updateConfig('authorPersonality', v)} placeholder="예: 까칠한, 다정한" />
                                  <SettingInput label="작가의 말투" isActive={toggles.useCustomSpeech} onToggle={() => actions.toggleConfig('useCustomSpeech')} value={config.authorTone} onChange={(v) => actions.updateConfig('authorTone', v)} placeholder="예: 정중한 해요체" />
                                </div>
                             </div>
                          </div>
                      </div>
                    </div>

                    {/* 집필 시작 버튼 */}
                    <div className="flex justify-end items-center mt-8 pt-6 border-t border-white/5">
                      <button
                        onClick={actions.generate}
                        disabled={!config.content.trim()}
                        className="relative px-8 py-3 bg-white text-black font-semibold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <span className="flex items-center gap-2 text-sm tracking-wide">
                          집필 시작하기
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </span>
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* 오류 화면 */}
          {loadingState === LoadingState.ERROR && (
            <div className="max-w-lg mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center animate-fade-in mt-10">
              <h3 className="text-xl font-bold text-white mb-2">오류 발생</h3>
              <p className="text-gray-400 mb-6">{errorMessage}</p>
              <button onClick={actions.reset} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors">다시 시도</button>
            </div>
          )}

          {/* 결과 화면 */}
          {hasResult && (
            <div ref={resultRef} className="animate-fade-in pb-12 pt-8">
              <div className="flex items-center justify-center mb-10 gap-3">
                 {isGenerating ? (
                   <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                      <span className="text-xs font-bold text-primary tracking-widest uppercase">AI 집필 중...</span>
                   </div>
                 ) : (
                   <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                     <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   </div>
                 )}
              </div>

              <NovelRenderer 
                rawMarkdown={markdown} 
                isStreaming={isGenerating} 
                authorPersonality={toggles.useCustomPersonality ? config.authorPersonality : null}
                authorTone={toggles.useCustomSpeech ? config.authorTone : null}
              />
              
              {isComplete && (
                <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-50 animate-slide-up">
                   <button
                      onClick={actions.reset}
                      className="pointer-events-auto px-6 py-3 bg-surface/90 backdrop-blur-md text-gray-300 hover:text-white border border-white/10 hover:border-white/30 rounded-full shadow-lg transition-all hover:-translate-y-1 font-medium text-sm flex items-center gap-2 group cursor-pointer"
                   >
                     새로운 이야기 만들기
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
