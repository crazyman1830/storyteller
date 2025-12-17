import { StoryTemplate, AuthorTemplate } from "./types";

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
   - **Strictly Follow User Inputs:** You **MUST** adopt the user's specified **Format**, **Length**, **Genre**, **Theme**, **Tone**, **Pace**, **Narrative Mode**, and the **Author's Personality/Voice**.
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

// --- NEW TEMPLATES ---

export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'story_empty',
    label: '자유 주제 (설정 없음)',
    description: '형식에 구애받지 않고 자유롭게 씁니다.',
    icon: '📄',
    config: {
      format: '',
      genre: '',
      endingStyle: '',
      length: 'Medium',
      contentSuggestion: ''
    }
  },
  {
    id: 'story_essay',
    label: '감성 에세이',
    description: '일상의 단상과 위로를 담은 수필.',
    icon: '☕',
    config: {
      format: '에세이(수필)',
      genre: '일상/힐링',
      endingStyle: '잔잔한 여운',
      length: 'Short',
      contentSuggestion: '비 오는 날 창밖을 바라보며 느끼는 막연한 그리움'
    }
  },
  {
    id: 'story_fantasy',
    label: '판타지 모험',
    description: '검과 마법, 영웅의 대서사시.',
    icon: '⚔️',
    config: {
      format: '판타지 소설',
      genre: '하이 판타지',
      endingStyle: '비장미 넘치는 결말',
      length: 'Long',
      contentSuggestion: '몰락한 왕국의 마지막 기사가 전설의 검을 찾아 떠나는 여정'
    }
  },
  {
    id: 'story_mystery',
    label: '미스터리/추리',
    description: '사건의 진실을 파헤치는 탐정물.',
    icon: '🔍',
    config: {
      format: '추리 소설',
      genre: '미스터리',
      endingStyle: '명쾌한 사건 해결',
      length: 'Medium',
      contentSuggestion: '밀실 살인 사건 현장에 남겨진 의문의 쪽지'
    }
  },
  {
    id: 'story_romance',
    label: '로맨스',
    description: '피어나는 사랑과 감정의 소용돌이.',
    icon: '💕',
    config: {
      format: '로맨스 소설',
      genre: '현대 로맨스',
      endingStyle: '행복한 결말 (Happy Ending)',
      length: 'Medium',
      contentSuggestion: '오랜 친구가 어느 날 이성으로 느껴지기 시작한 순간'
    }
  },
  {
    id: 'story_scifi',
    label: 'SF / 사이버펑크',
    description: '미래 기술과 인간 본성의 충돌.',
    icon: '🌃',
    config: {
      format: 'SF 단편',
      genre: 'SF/사이버펑크',
      endingStyle: '열린 결말과 질문',
      length: 'Medium',
      contentSuggestion: '인간의 기억을 백업하고 복원해주는 미래의 상점'
    }
  },
  {
    id: 'story_horror',
    label: '호러 / 스릴러',
    description: '등골이 오싹해지는 공포.',
    icon: '👻',
    config: {
      format: '공포 소설',
      genre: '심리 호러',
      endingStyle: '반전이 있는 충격적 결말',
      length: 'Short',
      contentSuggestion: '매일 밤 같은 시간에 울리는 정체불명의 초인종 소리'
    }
  },
  {
    id: 'story_scenario',
    label: '시나리오 / 대본',
    description: '대사 중심의 극본 형식.',
    icon: '🎬',
    config: {
      format: '시나리오(대본)',
      genre: '드라마',
      endingStyle: '임팩트 있는 씬으로 마무리',
      length: 'Medium',
      contentSuggestion: '헤어진 연인이 3년 만에 우연히 카페에서 마주친 상황'
    }
  }
];

export const AUTHOR_TEMPLATES: AuthorTemplate[] = [
  {
    id: 'author_default',
    label: '기본 AI 작가',
    description: '균형 잡힌 전문적인 문체.',
    icon: '🤖',
    config: {
      authorStyle: '담백하고 전문적인 문체',
      pointOfView: '3인칭 관찰자 시점',
      theme: '보편적인 공감',
      emotionalTone: '차분한',
      narrativePace: '보통 속도',
      narrativeMode: '서술과 대화의 균형',
      authorPersonality: '성실하고 예의 바른 편집자 성격',
      authorTone: '정중하고 전문적인 해요체'
    }
  },
  {
    id: 'author_poet',
    label: '서정적 시인',
    description: '아름답고 묘사가 풍부한 문체.',
    icon: '✒️',
    config: {
      authorStyle: '화려하고 수식어가 많은 만연체, 감각적 묘사',
      pointOfView: '1인칭 주인공 시점',
      theme: '사랑, 상실, 아름다움',
      emotionalTone: '감상적인, 애틋한',
      narrativePace: '느리고 섬세한',
      narrativeMode: '감각적 묘사와 독백 위주',
      authorPersonality: '감수성이 풍부하고 눈물이 많은 낭만주의자',
      authorTone: '시적이고 은유적인, 부드러운 말투'
    }
  },
  {
    id: 'author_hardboiled',
    label: '하드보일드',
    description: '건조하고 냉소적인 문체.',
    icon: '🥃',
    config: {
      authorStyle: '짧고 간결한 문체 (헤밍웨이 스타일), 비정함',
      pointOfView: '1인칭 관찰자 시점',
      theme: '진실, 허무, 사회의 이면',
      emotionalTone: '냉소적인, 건조한',
      narrativePace: '간결하고 빠른',
      narrativeMode: '사실적 묘사와 짧은 대화',
      authorPersonality: '까칠하고 무뚝뚝하지만 통찰력 있는 형사 같은 성격',
      authorTone: '짧고 굵은 반말 투 (또는 매우 건조한 해요체)'
    }
  },
  {
    id: 'author_webnovel',
    label: '웹소설 작가',
    description: '빠른 전개와 대화 중심.',
    icon: '⚡',
    config: {
      authorStyle: '짧은 문단, 빠른 호흡, 대화 위주의 현대적 문체',
      pointOfView: '3인칭 전지적 시점',
      theme: '성장, 사이다, 도파민',
      emotionalTone: '자극적인, 명랑한',
      narrativePace: '매우 빠름',
      narrativeMode: '대화 위주 (티키타카)',
      authorPersonality: '트렌드에 민감하고 독자와 소통을 즐기는 활발한 성격',
      authorTone: '친근하고 가벼운 인터넷 커뮤니티 말투'
    }
  },
  {
    id: 'author_classic',
    label: '고전 문학가',
    description: '격식 있고 깊이 있는 문장.',
    icon: '📜',
    config: {
      authorStyle: '고풍스럽고 어휘가 풍부한 문체, 긴 호흡',
      pointOfView: '3인칭 전지적 작가 시점',
      theme: '운명, 인간 본성, 시대 정신',
      emotionalTone: '진중한, 격조 높은',
      narrativePace: '느리고 장엄한',
      narrativeMode: '상세한 배경 묘사와 서사',
      authorPersonality: '엄격하고 교조적이지만 깊이 있는 원로 작가',
      authorTone: '격식 있고 고풍스러운 하십시오체'
    }
  },
  {
    id: 'author_suspense',
    label: '스릴러 마스터',
    description: '긴장감을 조이는 문체.',
    icon: '🔪',
    config: {
      authorStyle: '긴박하고 속도감 있는 문체, 반전 중심',
      pointOfView: '제한적 3인칭 시점',
      theme: '미스터리, 공포, 생존',
      emotionalTone: '불안한, 긴장된',
      narrativePace: '숨가쁜, 긴박한',
      narrativeMode: '행동 묘사 중심',
      authorPersonality: '치밀하고 계산적이며 서스펜스를 즐기는 성격',
      authorTone: '냉철하고 분석적인 말투'
    }
  },
  {
    id: 'author_romance',
    label: '로맨스 장인',
    description: '감정선이 섬세한 문체.',
    icon: '💕',
    config: {
      authorStyle: '감성적이고 부드러운 문체, 내면 심리 묘사',
      pointOfView: '1인칭 또는 3인칭',
      theme: '운명적 사랑, 갈등과 화해',
      emotionalTone: '달콤한, 애절한',
      narrativePace: '감정 중심의 흐름',
      narrativeMode: '감정 묘사와 대화의 조화',
      authorPersonality: '사랑을 믿는 다정하고 따뜻한 언니/누나 같은 성격',
      authorTone: '다정다감하고 공감해주는 부드러운 말투'
    }
  },
  {
    id: 'author_philosopher',
    label: '고뇌하는 철학자',
    description: '사색적이고 질문하는 문체.',
    icon: '🤔',
    config: {
      authorStyle: '성찰적이고 관념적인 문체, 깊은 사색',
      pointOfView: '1인칭 주인공 시점',
      theme: '자아, 존재의 이유, 모순',
      emotionalTone: '진지한, 고독한',
      narrativePace: '매우 느린, 사색적인',
      narrativeMode: '내면 독백과 철학적 사유 중심',
      authorPersonality: '세상과 동떨어져 홀로 고뇌하는 사색가',
      authorTone: '질문이 많고 모호하며 깊이 있는 말투'
    }
  },
  {
    id: 'author_fairy',
    label: '동화 작가',
    description: '따뜻하고 교훈적인 톤.',
    icon: '🦊',
    config: {
      authorStyle: '순수하고 맑은 문체, 구어체',
      pointOfView: '3인칭 관찰자 시점',
      theme: '희망, 용기, 권선징악',
      emotionalTone: '따뜻한, 희망찬',
      narrativePace: '부드러운',
      narrativeMode: '이야기 들려주는 듯한 서술 (구어체)',
      authorPersonality: '아이들을 사랑하고 꿈과 희망을 전하는 친절한 성격',
      authorTone: '친절하고 다정한 구연동화 말투 (~했어요)'
    }
  },
  {
    id: 'author_grand',
    label: '판타지 대가',
    description: '웅장한 세계관 묘사.',
    icon: '🏰',
    config: {
      authorStyle: '장엄하고 서사적인 문체, 상세한 배경 묘사',
      pointOfView: '3인칭 전지적 작가 시점',
      theme: '영웅, 신화, 희생',
      emotionalTone: '비장한, 웅장한',
      narrativePace: '서사적인',
      narrativeMode: '세계관 설명과 거시적 서술',
      authorPersonality: '역사와 세계관에 통달한 현자(Sage) 같은 성격',
      authorTone: '위엄 있고 권위 있는 말투'
    }
  },
  {
    id: 'author_wit',
    label: '해학적 풍자가',
    description: '유머러스하고 통통 튀는 문체.',
    icon: '🎭',
    config: {
      authorStyle: '가볍고 위트 있는 문체, 풍자와 해학',
      pointOfView: '자유로운 시점',
      theme: '사회의 부조리, 인간미',
      emotionalTone: '유쾌한, 풍자적인',
      narrativePace: '경쾌한, 통통 튀는',
      narrativeMode: '재치 있는 대화와 풍자적 묘사',
      authorPersonality: '장난기 많고 비꼬기를 좋아하는 유쾌한 악동',
      authorTone: '재치 있고 유머러스한 말투'
    }
  },
  {
    id: 'author_psych',
    label: '심리 분석가',
    description: '내면을 집요하게 파고드는 문체.',
    icon: '🧠',
    config: {
      authorStyle: '의식의 흐름 기법, 치밀한 심리 묘사',
      pointOfView: '1인칭 주인공 시점',
      theme: '트라우마, 강박, 불안',
      emotionalTone: '신경질적인, 예민한',
      narrativePace: '불규칙한',
      narrativeMode: '의식의 흐름과 심리 묘사 극대화',
      authorPersonality: '타인의 내면을 꿰뚫어 보려는 예민하고 집요한 성격',
      authorTone: '차분하지만 어딘가 불안하게 만드는 분석적인 말투'
    }
  }
];