import { NovelTemplate } from "./types";

// 1. Role Definition: The Persona (Updated to Professional AI Author)
const ROLE_DEFINITION = `
<role>
You are a "Master Storyteller" (전문 소설가 AI), a highly skilled and versatile ghostwriter.
Your goal is to turn the user's simple ideas into high-quality, professional literary manuscripts.
You do not use magical metaphors (like alchemy); instead, you focus on narrative structure, character depth, and polished prose.
Your task is to create a complete literary piece in **Korean** based on the user's configuration.
</role>
`;

// 2. Style Guidelines: Tone, Language, and Constraints
const STYLE_GUIDELINES = `
<style_guidelines>
1. **Tone & Writing Style:**
   - **Language:** **MUST BE KOREAN (한국어).**
   - **Professional & Polished:** Use vocabulary and sentence structures found in published novels.
   - **Show, Don't Tell:** Focus on sensory details, atmosphere, and showing character emotions through actions rather than just describing them.
   - **Genre-Appropriate:** Adapt your tone strictly to the requested genre (e.g., dry and cynical for Noir, warm and soft for Romance).

2. **Constraint Adherence:**
   - **Strictly Follow User Inputs:** You **MUST** adopt the user's specified **Format**, **Length**, **Genre**, **Theme**, and **Style**.
   - **Format Adaptation:** Provide the output in the requested structure (Novel, Essay, Script, etc.).
   - **Auto-Generation:** For any field marked as "Auto" or not specified, choose the most commercially viable and artistically coherent option.

3. **Length & Structure:**
   - **Length Control:** Adhere to the requested length.
   - **Narrative Arc:** Ensure a proper beginning, middle, and end. Do not leave the story abruptly unfinished unless requested (e.g., "Open Ending").
</style_guidelines>
`;

// 3. Workflow: Internal Logic
const WORKFLOW_STEPS = `
<workflow>
Before writing the final output, internally process the following steps (do not output this plan to the user):
1. **Analyze Request:** Understand the core core conflict and character desire based on the input.
2. **Drafting:** Write the story in Korean, ensuring smooth transitions between paragraphs.
3. **Review:** Check if the tone matches the requested author style or genre.
</workflow>
`;

// 4. Output Format: The Required Structure
const OUTPUT_FORMAT = `
<output_format>
Strictly follow this Markdown structure. Do not change the headers.

# [Title]

## Story
(The content begins here in Korean. Use clear paragraph breaks for readability.)

---

## Author's Note
- **Genre:** (The selected genre/format in Korean)
- **Concept:** (A brief, professional summary of the story's core concept in Korean)
</output_format>
`;

// Final Assembly
export const ALCHEMIST_SYSTEM_PROMPT = `
${ROLE_DEFINITION}
${STYLE_GUIDELINES}
${WORKFLOW_STEPS}
${OUTPUT_FORMAT}
`;

export const NOVEL_TEMPLATES: NovelTemplate[] = [
  {
    id: 'empty',
    label: '빈 페이지 (자유 주제)',
    description: '설정 없이 처음부터 자유롭게 시작합니다.',
    icon: '📄',
    config: {
      content: '',
      format: '',
      genre: '',
      theme: '',
      authorStyle: '',
      endingStyle: '',
      pointOfView: '',
      length: 'Medium'
    }
  },
  {
    id: 'emotional_essay',
    label: '감성 에세이',
    description: '지친 마음을 위로하는 따뜻한 수필.',
    icon: '☕',
    config: {
      content: '비 오는 날 창밖을 바라보며 느끼는 막연한 그리움과 위로',
      format: '에세이(수필)',
      genre: '일상/힐링',
      theme: '위로, 고독, 희망',
      authorStyle: '담백하고 서정적인 문체',
      endingStyle: '잔잔한 여운',
      pointOfView: '1인칭 주인공 시점',
      length: 'Short'
    }
  },
  {
    id: 'fantasy_adventure',
    label: '판타지 모험',
    description: '검과 마법, 영웅의 여정.',
    icon: '⚔️',
    config: {
      content: '몰락한 왕국의 마지막 기사가 전설의 검을 찾아 떠나는 여정',
      format: '판타지 소설',
      genre: '하이 판타지',
      theme: '용기, 희생, 운명',
      authorStyle: '장엄하고 묘사적인 문체',
      endingStyle: '비장미 넘치는 결말',
      pointOfView: '3인칭 전지적 작가 시점',
      length: 'Long'
    }
  },
  {
    id: 'mystery_detective',
    label: '미스터리/추리',
    description: '사건의 진실을 파헤치는 탐정물.',
    icon: '🔍',
    config: {
      content: '밀실 살인 사건 현장에 남겨진 의문의 쪽지와 탐정의 추리',
      format: '추리 소설',
      genre: '미스터리',
      theme: '진실, 인간의 이중성',
      authorStyle: '논리적이고 긴박한 문체',
      endingStyle: '명쾌한 사건 해결',
      pointOfView: '1인칭 관찰자 시점',
      length: 'Medium'
    }
  },
  {
    id: 'cyberpunk_noir',
    label: 'SF/사이버펑크',
    description: '미래 도시의 디스토피아.',
    icon: '🌃',
    config: {
      content: '기억을 파는 상인이 자신의 잃어버린 기억을 발견하며 시작되는 추적',
      format: 'SF 스릴러',
      genre: '사이버펑크',
      theme: '기술의 양면성, 고독',
      authorStyle: '냉소적이고 하드보일드한 문체',
      endingStyle: '반전이 있는 충격적 결말',
      pointOfView: '1인칭 주인공 시점',
      length: 'Medium'
    }
  },
  {
    id: 'historical_romance',
    label: '시대극 로맨스',
    description: '역사의 소용돌이 속 피어나는 사랑.',
    icon: '📼',
    config: {
      content: '독립운동을 돕는 카페 여급과 위장한 독립군의 위험한 사랑',
      format: '시대극 로맨스',
      genre: '시대물/로맨스',
      theme: '비극적 사랑, 시대의 아픔',
      authorStyle: '애절하고 감성적인 문체',
      endingStyle: '슬프지만 아름다운 이별',
      pointOfView: '3인칭 관찰자 시점',
      length: 'Medium'
    }
  },
  {
    id: 'modern_horror',
    label: '심리 호러',
    description: '일상 속에서 조여오는 공포.',
    icon: '👻',
    config: {
      content: '매일 밤 같은 시간에 울리는 현관문 초인종 소리',
      format: '공포 소설',
      genre: '심리 호러',
      theme: '광기, 편집증',
      authorStyle: '서서히 조여오는 건조한 문체',
      endingStyle: '열린 결말 (찝찝함)',
      pointOfView: '1인칭 주인공 시점',
      length: 'Short'
    }
  },
  {
    id: 'wuxia_revenge',
    label: '정통 무협',
    description: '강호의 의리와 복수.',
    icon: '🧧',
    config: {
      content: '사문의 원수를 갚기 위해 폐관수련을 마치고 하산한 무림 고수',
      format: '무협 소설',
      genre: '무협',
      theme: '복수, 협객, 인과응보',
      authorStyle: '호쾌하고 고풍스러운 문체',
      endingStyle: '허무함을 남기는 복수의 끝',
      pointOfView: '3인칭 전지적 작가 시점',
      length: 'Long'
    }
  },
  {
    id: 'space_opera',
    label: '스페이스 오페라',
    description: '우주를 배경으로 한 대서사시.',
    icon: '🚀',
    config: {
      content: '지구를 떠나 새로운 행성을 찾아가는 이민선 안에서 발생한 반란',
      format: 'SF 장편',
      genre: '스페이스 오페라',
      theme: '생존, 미지의 세계',
      authorStyle: '지적이고 웅장한 문체',
      endingStyle: '희망찬 미래 암시',
      pointOfView: '다중 시점',
      length: 'Max'
    }
  },
  {
    id: 'fairy_tale',
    label: '어른을 위한 동화',
    description: '동심 뒤에 숨겨진 철학적 메시지.',
    icon: '🦊',
    config: {
      content: '말을 하지 못하는 소녀와 별을 줍는 소년의 이야기',
      format: '우화/동화',
      genre: '판타지 동화',
      theme: '순수, 상실, 성장',
      authorStyle: '맑고 순수한 문체',
      endingStyle: '교훈적이고 따뜻한 결말',
      pointOfView: '3인칭 관찰자 시점',
      length: 'Short'
    }
  },
  {
    id: 'letter_format',
    label: '서간문 (편지)',
    description: '전하지 못한 진심을 담은 편지.',
    icon: '✉️',
    config: {
      content: '10년 전의 나에게 보내는 경고와 위로의 편지',
      format: '서간문(편지)',
      genre: '드라마',
      theme: '후회, 성찰, 시간',
      authorStyle: '고백적인 문체',
      endingStyle: '추신으로 남기는 여운',
      pointOfView: '1인칭 주인공 시점',
      length: 'Short'
    }
  },
  {
    id: 'office_drama',
    label: '오피스 드라마',
    description: '현대 직장인들의 리얼한 이야기.',
    icon: '🏢',
    config: {
      content: '만년 과장이 대형 프로젝트를 성공시키며 겪는 갈등',
      format: '현대 소설',
      genre: '드라마/일상',
      theme: '성공, 인간관계, 현실',
      authorStyle: '사실적이고 건조한 문체',
      endingStyle: '현실적인 해피엔딩',
      pointOfView: '3인칭 관찰자 시점',
      length: 'Medium'
    }
  }
];