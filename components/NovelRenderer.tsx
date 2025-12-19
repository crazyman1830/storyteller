
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { NovelContent, ChatMessage } from '../types';
import { generateFeedbackResponseStream } from '../services/geminiService';
import { parseNovelMarkdown } from '../utils/novelParser';

interface NovelRendererProps {
  rawMarkdown: string;
  isStreaming?: boolean;
  authorPersonality?: string | null;
  authorTone?: string | null;
}

const MAX_CHAT_TURNS = 10;

const NovelRenderer: React.FC<NovelRendererProps> = ({ 
  rawMarkdown, 
  isStreaming = false,
  authorPersonality = null,
  authorTone = null
}) => {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [fontType, setFontType] = useState<'serif' | 'sans'>('serif');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const content: NovelContent | null = useMemo(() => {
    return parseNovelMarkdown(rawMarkdown, isStreaming);
  }, [rawMarkdown, isStreaming]);

  const handleSendFeedback = async () => {
    if (!feedbackInput.trim() || !content || isSendingFeedback) return;
    
    const userMsg: ChatMessage = { role: 'user', text: feedbackInput.trim() };
    
    // 대화 내역 제한 (최근 MAX_CHAT_TURNS 만큼만 유지)
    const newHistory = [...chatHistory, userMsg].slice(-MAX_CHAT_TURNS * 2);
    
    setChatHistory(newHistory);
    setFeedbackInput('');
    setIsSendingFeedback(true);
    setChatHistory(prev => [...prev, { role: 'model', text: '' }]);

    try {
      const stream = generateFeedbackResponseStream(
        content.title, 
        content.body, 
        newHistory, 
        authorPersonality, 
        authorTone
      );
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setChatHistory(prev => {
          const last = prev[prev.length - 1];
          if (last.role === 'model') return [...prev.slice(0, -1), { role: 'model', text: fullResponse }];
          return prev;
        });
      }
    } catch (err) {
      setChatHistory(prev => [...prev.slice(0, -1), { role: 'model', text: "작가가 잠시 자리를 비운 것 같습니다. 잠시 후 다시 말을 걸어주세요." }]);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleCopyStory = () => {
    if (!content) return;
    const textToCopy = `# ${content.title}\n\n${content.body}\n\n---\n작가의 의도: ${content.meta.intent}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatOpen]);

  if (!content && !rawMarkdown) return null;

  const fontClass = fontType === 'serif' ? 'font-serif' : 'font-sans';
  const sizeClass = { 
    'sm': 'text-base', 
    'base': 'text-lg', 
    'lg': 'text-xl', 
    'xl': 'text-2xl leading-loose' 
  }[fontSize];

  return (
    <div className="w-full max-w-3xl mx-auto animate-slide-up pb-20">
        {/* 상단 컨트롤 바 */}
        <div className="flex justify-between items-center mb-8 px-4 py-3 bg-white/5 rounded-full backdrop-blur-sm border border-white/5 animate-fade-in">
            <div className="flex gap-1">
                <button 
                  onClick={() => setFontType('serif')} 
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${fontType === 'serif' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  명조
                </button>
                <button 
                  onClick={() => setFontType('sans')} 
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${fontType === 'sans' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  고딕
                </button>
            </div>
            <div className="flex gap-1 items-center">
                <button onClick={() => setFontSize('sm')} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${fontSize === 'sm' ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/10'}`}>가</button>
                <button onClick={() => setFontSize('base')} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${fontSize === 'base' ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/10'}`}>가</button>
                <button onClick={() => setFontSize('lg')} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${fontSize === 'lg' ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/10'}`}>가</button>
                <button onClick={() => setFontSize('xl')} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${fontSize === 'xl' ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/10'}`}>가</button>
            </div>
        </div>

        {/* 제목 섹션 */}
        <header className="mb-12 text-center">
            <h1 className={`font-bold text-white mb-6 leading-tight tracking-tight break-keep ${fontType === 'serif' ? 'font-serif' : 'font-sans'} text-3xl md:text-5xl`}>
                {content?.title}
            </h1>
            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto rounded-full"></div>
        </header>

        {/* 본문 섹션 */}
        <article className={`transition-all duration-300 ease-in-out text-gray-200 leading-loose space-y-6 text-justify break-keep tracking-wide ${fontClass} ${sizeClass}`}>
            {content?.body.split('\n').map((para, index) => {
                const cleanPara = para.trim();
                if (!cleanPara || cleanPara.startsWith('#')) return null;
                return <p key={index}>{cleanPara}</p>;
            })}
            {isStreaming && <span className="inline-block w-2 h-5 ml-1 align-middle bg-primary animate-pulse"></span>}
        </article>

        {/* 완료 후 표시되는 추가 섹션 */}
        {(content?.meta.intent !== '...' || !isStreaming) && (
          <>
             {/* 작가의 의도 */}
             <footer className="mt-20 pt-10 border-t border-white/5 animate-fade-in">
                <div className="glass-panel rounded-2xl p-8 relative group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest font-sans">작가의 의도</h3>
                      <button 
                        onClick={handleCopyStory}
                        className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${copyStatus === 'copied' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'}`}
                      >
                        {copyStatus === 'copied' ? '복사됨!' : '원고 복사하기'}
                      </button>
                    </div>
                    <p className="text-gray-400 font-serif italic leading-relaxed">"{content?.meta.intent}"</p>
                </div>
            </footer>

            {/* 작가와의 대화 (채팅) */}
            <div className="mt-12 pt-10 border-t border-white/5 animate-fade-in font-sans">
              {!isChatOpen ? (
                <button 
                  onClick={() => setIsChatOpen(true)} 
                  className="w-full py-4 border border-dashed border-white/20 rounded-xl text-gray-500 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  작가에게 감상평 남기고 대화하기
                </button>
              ) : (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden animate-slide-up">
                  <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/5">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-bold text-gray-300">작가와의 대화</span>
                     </div>
                     <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                  </div>
                  
                  <div className="p-4 md:p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar bg-black/20">
                     {chatHistory.length === 0 && (
                       <p className="text-center text-gray-600 text-xs py-10 italic">작가에게 궁금한 점이나 감상을 자유롭게 물어보세요.</p>
                     )}
                     {chatHistory.map((msg, idx) => (
                       <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`relative max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-primary text-black font-medium' 
                              : 'bg-white/10 text-gray-200 border border-white/5'
                          }`}>
                             {msg.role === 'model' && (
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Author</span>
                                </div>
                             )}
                             {msg.text}
                             {msg.role === 'model' && msg.text === '' && (
                               <div className="flex gap-1 items-center h-4">
                                 <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                                 <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                 <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                               </div>
                             )}
                          </div>
                       </div>
                     ))}
                     <div ref={chatEndRef}></div>
                  </div>

                  <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                    <div className="flex gap-2">
                      <textarea
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendFeedback();
                          }
                        }}
                        placeholder="메시지를 입력하세요 (Enter로 전송)"
                        className="flex-grow bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none text-sm h-[50px] focus:h-[80px]"
                        disabled={isSendingFeedback}
                      />
                      <button 
                        onClick={handleSendFeedback} 
                        disabled={!feedbackInput.trim() || isSendingFeedback} 
                        className="w-12 h-[50px] bg-white text-black rounded-xl hover:bg-primary transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        {isSendingFeedback ? (
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    </div>
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
