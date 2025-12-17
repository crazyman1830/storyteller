import { NovelContent } from '../types';

/**
 * Parses the raw markdown response from the AI into a structured NovelContent object.
 * Extracts title, body, and metadata (genre, intent).
 */
export const parseNovelMarkdown = (rawMarkdown: string, isStreaming: boolean): NovelContent | null => {
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
};