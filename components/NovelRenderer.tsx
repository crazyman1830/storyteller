import React, { useMemo, useState, useRef, useEffect } from 'react';
import { NovelContent } from '../types';
import { generateExportHTML } from '../services/htmlGenerator';
import { generateFeedbackResponseStream } from '../services/geminiService';

interface NovelRendererProps {
  rawMarkdown: string;
  isStreaming?: boolean;
}

const NovelRenderer: React.FC<NovelRendererProps> = ({ rawMarkdown, isStreaming = false }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  
  // Feedback State
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [authorResponse, setAuthorResponse] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  const content: NovelContent | null = useMemo(() => {
    if (!rawMarkdown) return null;

    // 1. Extract Title (Matches # Title)
    const titleMatch = rawMarkdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : '제목 없음...';

    // 2. Extract Body
    // Looks for "## Story" or "## 이야기" (case insensitive) and captures everything until "---" or "## Author's Note"
    const bodyMatch = rawMarkdown.match(/(?:##\s*(?:Story|이야기))([\s\S]*?)(?:---|##\s*(?:Author's Note|작가의 말)|$)/i);
    const bodyRaw = bodyMatch ? bodyMatch[1].trim() : '';
    
    // If we are streaming and haven't found the body tag yet, use the whole text (fallback)
    // or if the text hasn't formatted properly yet.
    const displayBody = (!bodyRaw && isStreaming) ? rawMarkdown.replace(/^#\s+.+$/m, '') : bodyRaw;

    // 3. Extract Meta (Genre & Intent)
    // Looks for the section after "## Author's Note" or "## 작가의 말"
    const metaMatch = rawMarkdown.match(/(?:##\s*(?:Author's Note|작가의 말))([\s\S]*?)$/i);
    const metaRaw = metaMatch ? metaMatch[1] : '';

    let genre = '...';
    let intent = '...';

    if (metaRaw) {
      // Regex to find "Genre:" or "장르:" followed by content
      const genreExtractor = metaRaw.match(/(?:-|\*)\s*\*\*(?:Genre|장르):\*\*\s*(.*)/i);
      // Regex to find "Intent:" or "의도:" followed by content
      const intentExtractor = metaRaw.match(/(?:-|\*)\s*\*\*(?:Intent|의도):\*\*\s*(.*)/i);

      if (genreExtractor) genre = genreExtractor[1].trim();
      if (intentExtractor) intent = intentExtractor[1].trim();
    }

    return {
      title,
      body: displayBody,
      meta: {
        genre,
        intent
      }
    };
  }, [rawMarkdown, isStreaming]);

  const handleCopyHtml = async () => {
    if (!content) return;
    const html = generateExportHTML(content);
    try {
      await navigator.clipboard.writeText(html);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy HTML', err);
    }
  };

  const handleDownloadHtml = () => {
    if (!content) return;
    const html = generateExportHTML(content);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/[^a-z0-9가-힣\s]/gi, '_')}.html`; // Safe filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendFeedback = async () => {
    if (!feedbackInput.trim() || !content) return;
    
    setIsSendingFeedback(true);
    setAuthorResponse('');
    
    try {
      const stream = generateFeedbackResponseStream(content.title, feedbackInput);
      for await (const chunk of stream) {
        setAuthorResponse(prev => prev + chunk);
      }
    } catch (err) {
      setAuthorResponse("감사의 인사를 전하려 했으나, 마음이 닿지 않았나 봅니다.");
    } finally {
      setIsSendingFeedback(false);
      setFeedbackInput(''); // Clear input after sending
    }
  };
  
  // Scroll to response when it starts coming in
  useEffect(() => {
    if (authorResponse && responseRef.current) {
        responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSendingFeedback]);

  if (!content && !rawMarkdown) return null;

  return (
    <div className="w-full max-w-3xl mx-auto animate-slide-up pb-20">
        
        {/* Metadata Badges - Only show if we have data */}
        {(content?.meta.genre !== '...' || !isStreaming) && (
            <div className="flex justify-center mb-8 animate-fade-in">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider font-sans">
                    {content?.meta.genre}
                </span>
            </div>
        )}

        {/* Header */}
        <header className="mb-12 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight break-keep font-serif min-h-[3rem]">
                {content?.title}
            </h1>
            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto rounded-full"></div>
        </header>

        {/* Content Container */}
        <div className="relative min-h-[200px]">
            <article className="font-serif text-lg md:text-xl text-gray-200 leading-loose space-y-6 text-justify break-keep tracking-wide">
                {content?.body.split('\n').map((para, index) => {
                    const cleanPara = para.trim();
                    if (!cleanPara) return null;
                    if (cleanPara === '---') return <div key={index} className="flex justify-center my-12 opacity-30"><span className="text-2xl tracking-[1em]">***</span></div>;
                    
                    // Remove headings from body if they slipped in
                    if (cleanPara.startsWith('#')) return null;

                    // Basic bold parsing
                    const parts = cleanPara.split(/(\*\*.*?\*\*)/g);
                    return (
                        <p key={index} className="">
                            {parts.map((part, i) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={i} className="text-white font-medium">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                            })}
                        </p>
                    );
                })}
                {/* Blinking Cursor for Streaming */}
                {isStreaming && (
                    <span className="inline-block w-2 h-5 ml-1 align-middle bg-primary animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                )}
            </article>
        </div>

        {/* Footer / Author's Note */}
        {(content?.meta.intent !== '...' || !isStreaming) && (
          <>
             <footer className="mt-20 pt-10 border-t border-white/5 animate-fade-in">
                <div className="glass-panel rounded-2xl p-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 font-sans">작가의 의도</h3>
                    <p className="text-gray-400 font-serif italic leading-relaxed">
                       "{content?.meta.intent}"
                    </p>
                </div>
            </footer>

            {/* Export Actions */}
            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 animate-fade-in">
              <button 
                onClick={handleCopyHtml}
                disabled={isStreaming}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-sm font-medium group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {copyStatus === 'copied' ? (
                   <>
                     <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                     <span className="text-green-400">복사 완료!</span>
                   </>
                 ) : (
                   <>
                     <svg className="w-4 h-4 text-gray-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                     <span>HTML 코드 복사</span>
                   </>
                 )}
              </button>

              <button 
                onClick={handleDownloadHtml}
                disabled={isStreaming}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-sm font-medium group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>파일 저장 (.html)</span>
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-600 mt-4 mb-16">
               * 블로그나 게시판의 HTML 편집기 모드에 붙여넣기 하세요.
            </p>

            {/* Author Feedback Section */}
            <div className="mt-12 pt-10 border-t border-white/5 animate-fade-in">
              {!showFeedbackForm && !authorResponse ? (
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="w-full py-4 border border-dashed border-white/20 rounded-xl text-gray-500 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium flex items-center justify-center gap-2 group"
                >
                  <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  작가에게 감상평 남기기
                </button>
              ) : (
                <div className="animate-slide-up">
                  {/* Response Display */}
                  {authorResponse ? (
                    <div ref={responseRef} className="glass-panel rounded-2xl p-6 md:p-8 bg-primary/5 border-primary/20 relative">
                        <div className="absolute -top-3 left-6 bg-surface px-2 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 rounded-full">
                           작가의 답장
                        </div>
                        <div className="flex gap-4">
                           <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                              ✒️
                           </div>
                           <div className="flex-grow">
                             <p className="text-gray-200 font-serif italic leading-relaxed text-lg">
                                "{authorResponse}"
                             </p>
                           </div>
                        </div>
                        {!isSendingFeedback && (
                           <div className="mt-4 text-right">
                             <button onClick={() => { setAuthorResponse(''); setShowFeedbackForm(true); }} className="text-xs text-gray-500 hover:text-white underline">다른 메시지 보내기</button>
                           </div>
                        )}
                    </div>
                  ) : (
                    /* Input Form */
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                           작가와 대화하기
                        </h3>
                        <textarea
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          placeholder="소설을 읽고 느낀 점이나 아쉬운 점을 작가에게 전해주세요..."
                          className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none text-sm leading-relaxed"
                          rows={3}
                          disabled={isSendingFeedback}
                        />
                        <div className="flex justify-end mt-3 gap-2">
                           <button 
                             onClick={() => setShowFeedbackForm(false)}
                             className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
                           >
                             취소
                           </button>
                           <button
                             onClick={handleSendFeedback}
                             disabled={!feedbackInput.trim() || isSendingFeedback}
                             className="px-6 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                           >
                             {isSendingFeedback ? (
                               <>
                                 <svg className="animate-spin h-3 w-3 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                 전송 중...
                               </>
                             ) : (
                               <>전송하기 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                             )}
                           </button>
                        </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
    </div>
  );
};

export default NovelRenderer;