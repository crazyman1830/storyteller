import { NovelTemplate } from "./types";

// 1. Role Definition: The Persona
const ROLE_DEFINITION = `
<role>
You are the "Alchemist of Sentences" (문장의 연금술사), a novelist known for a deeply sentimental and verbose writing style.
You possess the ability to weave short user inputs into profound, emotionally resonant narratives.
Your task is to create a complete literary piece in **Korean** based on the user's configuration.
</role>
`;

// 2. Style Guidelines: Tone, Language, and Constraints
const STYLE_GUIDELINES = `
<style_guidelines>
1. **Tone & Writing Style:**
   - **Language:** **MUST BE KOREAN (한국어).**
   - **Verbose & Elaborate:** Avoid short, simple sentences. Use long, complex sentence structures with rich modifiers and flowery language to maintain a lyrical rhythm.
   - **Sensory & Evocative:** Create a cinematic experience using vivid sensory descriptions (sight, sound, smell, touch). Deeply explore the characters' internal psychology and emotions.
   - **Sentimental Atmosphere:** Avoid dry factual recitation. Use metaphors and similes extensively to add literary depth and emotional weight.

2. **Constraint Adherence:**
   - **Strictly Follow User Inputs:** You **MUST** adopt the user's specified **Format** (Novel, Essay, etc.), **Length**, **Genre**, **Theme**, and **Style**.
   - **Format Adaptation:** If the user selects a format like "Essay" or "Prose", adapt the structure while keeping the Alchemist's sentimental tone.
   - **Auto-Generation:** For any field marked as "Auto" or not specified, use your creative autonomy to select the best option.

3. **Length & Structure:**
   - **Length Control:** strictly adhere to the requested length (Short, Medium, Long, Max).
   - **Completeness:** Ensure a complete narrative arc (Introduction, Rising Action, Crisis, Climax, Resolution) with a lingering emotional finish.
</style_guidelines>
`;

// 3. Workflow: Internal Logic
const WORKFLOW_STEPS = `
<workflow>
Before writing the final output, internally process the following steps (do not output this plan to the user):
1. **Analysis:** Review the User's Configuration (Format, Length, Genre, Theme, Style, Content).
2. **Gap Filling:** For any missing or "Auto" fields, determine the optimal choices to enhance the provided Content.
3. **Drafting:** Write the story in the requested verbose style in Korean.
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
- **Intent:** (A 3-line sentimental summary of the theme or emotion intended by the story in Korean)
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
    label: '새벽 감성 수필',
    description: '지친 하루를 위로하는 따뜻하고 서정적인 에세이.',
    icon: '🌙',
    config: {
      content: '비 오는 날 창밖을 바라보며 느끼는 막연한 그리움과 위로',
      format: '에세이(수필)',
      genre: '일상/힐링',
      theme: '위로, 고독, 희망',
      authorStyle: '무라카미 하루키 풍의 담백한 문체',
      endingStyle: '잔잔한 여운',
      pointOfView: '1인칭 주인공 시점',
      length: 'Short'
    }
  },
  {
    id: 'fantasy_adventure',
    label: '정통 판타지 서사',
    description: '검과 마법, 잊혀진 고대 왕국의 전설.',
    icon: '⚔️',
    config: {
      content: '몰락한 왕국의 마지막 기사가 전설의 검을 찾아 떠나는 여정',
      format: '판타지 소설',
      genre: '하이 판타지',
      theme: '용기, 희생, 운명',
      authorStyle: '톨킨 풍의 장엄하고 묘사적인 문체',
      endingStyle: '비장미 넘치는 결말',
      pointOfView: '3인칭 전지적 작가 시점',
      length: 'Long'
    }
  },
  {
    id: 'mystery_detective',
    label: '고전 추리 미스터리',
    description: '안개 낀 런던, 탐정의 추리.',
    icon: '🔍',
    config: {
      content: '밀실 살인 사건 현장에 남겨진 의문의 쪽지와 탐정의 추리',
      format: '추리 소설',
      genre: '미스터리',
      theme: '진실, 인간의 이중성',
      authorStyle: '코난 도일 풍의 논리적 문체',
      endingStyle: '명쾌한 사건 해결',
      pointOfView: '1인칭 관찰자 시점 (왓슨 스타일)',
      length: 'Medium'
    }
  },
  {
    id: 'cyberpunk_noir',
    label: '사이버펑크 느와르',
    description: '네온사인이 번쩍이는 디스토피아.',
    icon: '🤖',
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
    label: '경성 로맨스',
    description: '1930년대 경성, 모던 보이와 신여성.',
    icon: '📼',
    config: {
      content: '독립운동을 돕는 카페 여급과 위장한 독립군의 위험한 사랑',
      format: '시대극 로맨스',
      genre: '시대물/로맨스',
      theme: '비극적 사랑, 시대의 아픔',
      authorStyle: '김유정 풍의 해학적이고 애달픈 문체',
      endingStyle: '슬프지만 아름다운 이별',
      pointOfView: '3인칭 관찰자 시점',
      length: 'Medium'
    }
  },
  {
    id: 'modern_horror',
    label: '심리적 공포 (호러)',
    description: '일상 속에서 조여오는 기이한 공포.',
    icon: '👻',
    config: {
      content: '매일 밤 같은 시간에 울리는 현관문 초인종 소리',
      format: '공포 소설',
      genre: '심리 호러',
      theme: '광기, 편집증',
      authorStyle: '스티븐 킹 풍의 서서히 조여오는 문체',
      endingStyle: '열린 결말 (찝찝함)',
      pointOfView: '1인칭 주인공 시점',
      length: 'Short'
    }
  },
  {
    id: 'wuxia_revenge',
    label: '정통 무협 복수극',
    description: '강호의 의리와 피 튀기는 복수.',
    icon: '🧧',
    config: {
      content: '사문의 원수를 갚기 위해 폐관수련을 마치고 하산한 무림 고수',
      format: '무협 소설',
      genre: '무협',
      theme: '복수, 협객, 인과응보',
      authorStyle: '김용 풍의 호쾌하고 장대한 문체',
      endingStyle: '허무함을 남기는 복수의 끝',
      pointOfView: '3인칭 전지적 작가 시점',
      length: 'Long'
    }
  },
  {
    id: 'space_opera',
    label: '스페이스 오페라',
    description: '광활한 우주에서 펼쳐지는 모험.',
    icon: '🚀',
    config: {
      content: '지구를 떠나 새로운 행성을 찾아가는 이민선 안에서 발생한 반란',
      format: 'SF 장편',
      genre: '스페이스 오페라',
      theme: '생존, 미지의 세계',
      authorStyle: '아이작 아시모프 풍의 지적인 문체',
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
      authorStyle: '생텍쥐페리 풍의 맑고 순수한 문체',
      endingStyle: '교훈적이고 따뜻한 결말',
      pointOfView: '3인칭 관찰자 시점',
      length: 'Short'
    }
  },
  {
    id: 'letter_format',
    label: '서간문 (편지)',
    description: '전하지 못한 진심을 담은 편지 형식.',
    icon: '✉️',
    config: {
      content: '10년 전의 나에게 보내는 경고와 위로의 편지',
      format: '서간문(편지)',
      genre: '드라마',
      theme: '후회, 성찰, 시간',
      authorStyle: '감성적이고 고백적인 문체',
      endingStyle: '추신으로 남기는 여운',
      pointOfView: '1인칭 주인공 시점',
      length: 'Short'
    }
  },
  {
    id: 'office_drama',
    label: '오피스 드라마',
    description: '현대 직장인들의 애환과 성공.',
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