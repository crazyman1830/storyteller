import React, { useMemo, useState, useRef, useEffect } from 'react';
import { NovelContent, ChatMessage } from '../types';
import { generateExportHTML } from '../services/htmlGenerator';
import { generateFeedbackResponseStream } from '../services/geminiService';
import { parseNovelMarkdown } from '../utils/novelParser';

interface NovelRendererProps {
  rawMarkdown: string;
  isStreaming?: boolean;
  authorPersonality?: string | null;
  authorTone?: string | null;
}

const MAX_CHAT_TURNS = 5; // Max interactions

const NovelRenderer: React.FC<NovelRendererProps> = ({ 
  rawMarkdown, 
  isStreaming = false,
  authorPersonality = null,
  authorTone = null
}) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  
  // Reader Settings
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [fontType, setFontType] = useState<'serif' | 'sans'>('serif');

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Use the utility function for parsing
  const content: NovelContent | null = useMemo(() => {
    return parseNovelMarkdown(rawMarkdown, isStreaming);
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
    if (!feedbackInput.trim() || !content || isSendingFeedback) return;
    
    // 1. Add User Message
    const userMsg: ChatMessage = { role: 'user', text: feedbackInput.trim() };
    const newHistory = [...chatHistory, userMsg];
    
    setChatHistory(newHistory);
    setFeedbackInput('');
    setIsSendingFeedback(true);
    
    // 2. Add Placeholder for Model Message
    setChatHistory(prev => [...prev, { role: 'model', text: '' }]);

    try {
      const stream = generateFeedbackResponseStream(
        content.title, 
        newHistory, // Pass full history
        authorPersonality,
        authorTone
      );
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setChatHistory(prev => {
          const last = prev[prev.length - 1];
          // Update only if the last message is the model's placeholder
          if (last.role === 'model') {
             return [...prev.slice(0, -1), { role: 'model', text: fullResponse }];
          }
          return prev;
        });
      }
    } catch (err) {
      setChatHistory(prev => [...prev.slice(0, -1), { role: 'model', text: "작가가 잠시 자리를 비운 것 같습니다. (오류 발생)" }]);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatOpen]);

  // Handle Enter key in textarea
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendFeedback();
    }
  };

  if (!content && !rawMarkdown) return null;

  // Dynamic Styles
  const fontClass = fontType === 'serif' ? 'font-serif' : 'font-sans';
  const sizeClass = {
    'sm': 'text-base',
    'base': 'text-lg',
    'lg': 'text-xl',
    'xl': 'text-2xl leading-loose'
  }[fontSize];

  const userTurnCount = chatHistory.filter(m => m.role === 'user').length;
  const isChatLimitReached = userTurnCount >= MAX_CHAT_TURNS;

  return (
    <div className="w-full max-w-3xl mx-auto animate-slide-up pb-20">
        
        {/* Metadata Badges */}
        {(content?.meta.genre !== '...' || !isStreaming) && (
            <div className="flex justify-center mb-8 animate-fade-in">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider font-sans">
                    {content?.meta.genre}
                </span>
            </div>
        )}

        {/* Reader Toolbar */}
        <div className="flex justify-between items-center mb-8 px-4 py-3 bg-white/5 rounded-full backdrop-blur-sm border border-white/5 animate-fade-in">
            <div className="flex gap-1">
                <button onClick={() => setFontType('serif')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${fontType === 'serif' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>명조</button>
                <button onClick={() => setFontType('sans')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${fontType === 'sans' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>고딕</button>
            </div>
            <div className="w-px h-4 bg-white/10 mx-2"></div>
            <div className="flex gap-1 items-center">
                <span className="text-[10px] text-gray-500 mr-1">크기</span>
                <button onClick={() => setFontSize('sm')} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${fontSize === 'sm' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:bg-white/10'}`}>가</button>
                <button onClick={() => setFontSize('base')} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${fontSize === 'base' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:bg-white/10'}`}>가</button>
                <button onClick={() => setFontSize('lg')} className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-all ${fontSize === 'lg' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:bg-white/10'}`}>가</button>
                <button onClick={() => setFontSize('xl')} className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${fontSize === 'xl' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:bg-white/10'}`}>가</button>
            </div>
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
            <h1 className={`font-bold text-white mb-6 leading-tight tracking-tight break-keep ${fontType === 'serif' ? 'font-serif' : 'font-sans'} text-3xl md:text-5xl min-h-[3rem]`}>
                {content?.title}
            </h1>
            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto rounded-full"></div>
        </header>

        {/* Content Container */}
        <div className="relative min-h-[200px]">
            <article className={`transition-all duration-300 ease-in-out text-gray-200 leading-loose space-y-6 text-justify break-keep tracking-wide ${fontClass} ${sizeClass}`}>
                {content?.body.split('\n').map((para, index) => {
                    const cleanPara = para.trim();
                    if (!cleanPara) return null;
                    if (cleanPara === '---') return <div key={index} className="flex justify-center my-12 opacity-30"><span className="text-2xl tracking-[1em]">***</span></div>;
                    
                    if (cleanPara.startsWith('#')) return null;

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
                {isStreaming && (
                    <span className="inline-block w-2 h-5 ml-1 align-middle bg-primary animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                )}
            </article>
        </div>

        {/* Footer */}
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

            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 animate-fade-in">
              <button 
                onClick={handleCopyHtml}
                disabled={isStreaming}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-sm font-medium group disabled:opacity-50 disabled:cursor-not-allowed font-sans"
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-sm font-medium group disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>파일 저장 (.html)</span>
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-600 mt-4 mb-16 font-sans">
               * 블로그나 게시판의 HTML 편집기 모드에 붙여넣기 하세요.
            </p>

            {/* Chat Interface with Author */}
            <div className="mt-12 pt-10 border-t border-white/5 animate-fade-in font-sans">
              {!isChatOpen ? (
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="w-full py-4 border border-dashed border-white/20 rounded-xl text-gray-500 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium flex items-center justify-center gap-2 group"
                >
                  <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  작가에게 감상평 남기고 대화하기
                </button>
              ) : (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden animate-slide-up">
                  {/* Chat Header */}
                  <div className="bg-white/5 p-4 flex items-center gap-3 border-b border-white/5">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     <span className="text-sm font-bold text-gray-300">작가와의 대화</span>
                     <span className="text-xs text-gray-500 ml-auto">
                        남은 대화: <span className="text-primary font-bold">{Math.max(0, MAX_CHAT_TURNS - userTurnCount)}</span>/{MAX_CHAT_TURNS}
                     </span>
                  </div>

                  {/* Message List */}
                  <div className="p-4 md:p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar bg-black/20">
                     {chatHistory.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-8 italic">
                           "독자님의 목소리를 들려주세요. 답변을 기다리고 있습니다."
                        </div>
                     )}
                     
                     {chatHistory.map((msg, idx) => (
                       <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                             msg.role === 'user' 
                               ? 'bg-primary text-black font-medium rounded-tr-none' 
                               : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-none font-serif italic'
                          }`}>
                             {msg.role === 'model' && (
                                <div className="text-[10px] text-gray-400 mb-1 not-italic font-sans uppercase tracking-wider font-bold">Author</div>
                             )}
                             {msg.text}
                          </div>
                       </div>
                     ))}
                     
                     {isSendingFeedback && chatHistory[chatHistory.length - 1]?.role === 'user' && (
                       <div className="flex justify-start">
                          <div className="bg-white/10 text-gray-200 border border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                             <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                             <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                          </div>
                       </div>
                     )}
                     <div ref={chatEndRef}></div>
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                    {isChatLimitReached ? (
                       <div className="text-center py-3 text-sm text-gray-500 bg-black/20 rounded-xl border border-white/5">
                          대화가 종료되었습니다. 더 깊은 이야기는 새로운 작품에서 만나요.
                       </div>
                    ) : (
                       <div className="flex gap-2">
                          <textarea
                            value={feedbackInput}
                            onChange={(e) => setFeedbackInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="메시지를 입력하세요..."
                            className="flex-grow bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none text-sm leading-relaxed custom-scrollbar h-[50px] focus:h-[80px]"
                            disabled={isSendingFeedback}
                          />
                          <button
                            onClick={handleSendFeedback}
                            disabled={!feedbackInput.trim() || isSendingFeedback}
                            className="flex-shrink-0 w-12 h-[50px] bg-white text-black rounded-xl hover:bg-primary transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                             {isSendingFeedback ? (
                               <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             ) : (
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                             )}
                          </button>
                       </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
    </div>
  );
};

export default NovelRenderer;