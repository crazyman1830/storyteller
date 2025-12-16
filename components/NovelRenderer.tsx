import React, { useMemo } from 'react';
import { NovelContent } from '../types';

interface NovelRendererProps {
  rawMarkdown: string;
  isStreaming?: boolean;
}

const NovelRenderer: React.FC<NovelRendererProps> = ({ rawMarkdown, isStreaming = false }) => {
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
             <footer className="mt-20 pt-10 border-t border-white/5 animate-fade-in">
                <div className="glass-panel rounded-2xl p-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 font-sans">작가의 의도</h3>
                    <p className="text-gray-400 font-serif italic leading-relaxed">
                       "{content?.meta.intent}"
                    </p>
                </div>
            </footer>
        )}
    </div>
  );
};

export default NovelRenderer;