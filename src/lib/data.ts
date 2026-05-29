import type { Level, LevelInfo, NavItem, RankingUser, Scenario, TranscriptEntry, UserProfile, UserStats, VocabWord, VoiceFeedItem } from '../types';

export const SCENARIOS: Scenario[] = [
  { id: 'airport',    en: 'Airport',          ko: '공항',             level: 'beg', desc: '체크인, 수하물 위탁, 탑승구 안내', icon: '✈️',  role: 'Airport Staff',  roleKo: '공항 직원', opener: "Good morning! Welcome to the check-in counter. May I see your passport and ticket, please?" },
  { id: 'restaurant', en: 'Restaurant',        ko: '레스토랑',         level: 'beg', desc: '자리 예약, 주문, 불만 표현',         icon: '🍽️', role: 'Waiter',          roleKo: '레스토랑 직원', opener: "Hi there, welcome! Do you have a reservation, or is it a table for how many today?" },
  { id: 'shopping',   en: 'Shopping',          ko: '가게',             level: 'beg', desc: '상품 문의, 계산, 환불·교환',         icon: '🛍️', role: 'Shop Assistant',  roleKo: '점원',     opener: "Hello! Let me know if you need any help finding something. Are you looking for anything in particular?" },
  { id: 'hospital',   en: 'Hospital',          ko: '병원',             level: 'mid', desc: '증상 설명, 진료 대화',               icon: '🩺',  role: 'Doctor',          roleKo: '의사',     opener: "Hello, please have a seat. So, what seems to be the problem today? Tell me about your symptoms." },
  { id: 'hotel',      en: 'Hotel',             ko: '호텔',             level: 'mid', desc: '체크인, 룸서비스, 불편 접수',         icon: '🏨',  role: 'Receptionist',    roleKo: '호텔 직원', opener: "Good evening, welcome to The Maple Hotel! Do you have a reservation with us tonight?" },
  { id: 'smalltalk',  en: 'Small Talk',        ko: '이웃과 스몰토크',  level: 'mid', desc: '일상 대화, 날씨·근황',               icon: '🌤️', role: 'Neighbor',        roleKo: '이웃',     opener: "Oh hey! Funny running into you here. Lovely weather we're having, isn't it? How have you been?" },
  { id: 'callcenter', en: 'Customer Service',  ko: '고객센터 전화',    level: 'adv', desc: '제품·서비스 문제 전화 해결',         icon: '☎️',  role: 'Support Agent',   roleKo: '상담원',   opener: "Thank you for calling TechCare support, my name is Alex. How can I help you today?" },
  { id: 'interview',  en: 'Job Interview',     ko: '취업 면접',        level: 'adv', desc: '자기소개, 경험 서술, 역질문',         icon: '💼',  role: 'Interviewer',     roleKo: '면접관',   opener: "Thanks for coming in today. To start, could you tell me a little bit about yourself?" },
  { id: 'speech',     en: 'Speech',            ko: '공식 발표',        level: 'adv', desc: '프레젠테이션 발표, 청중 질문',       icon: '🎤',  role: 'Moderator',       roleKo: '진행자',   opener: "The floor is yours. Whenever you're ready, please begin your presentation for the audience." },
];

export const LEVELS: Record<Level, LevelInfo> = {
  beg: { ko: '초급', cls: 'beg', color: 'var(--lv-beg)' },
  mid: { ko: '중급', cls: 'mid', color: 'var(--lv-mid)' },
  adv: { ko: '고급', cls: 'adv', color: 'var(--lv-adv)' },
};

export const NAV: NavItem[] = [
  { id: 'home',       ko: '홈',        icon: 'home'   },
  { id: 'vocab',      ko: '단어장',    icon: 'cards'  },
  { id: 'transcript', ko: '대본',      icon: 'doc'    },
  { id: 'ranking',    ko: '랭킹',      icon: 'trophy' },
  { id: 'mypage',     ko: '마이페이지', icon: 'user'  },
];

export const VOCAB_SEED: VocabWord[] = [
  { word: 'accommodate',  ipa: '/əˈkɒmədeɪt/',       ko: '수용하다, 숙박시키다', miss: 4, weak: '발음', scenario: 'hotel',      added: '2026-05-26', score: 38 },
  { word: 'itinerary',    ipa: '/aɪˈtɪnərəri/',       ko: '여행 일정',            miss: 3, weak: '억양', scenario: 'airport',    added: '2026-05-26', score: 41 },
  { word: 'turbulence',   ipa: '/ˈtɜːbjələns/',       ko: '난기류',               miss: 3, weak: '발음', scenario: 'airport',    added: '2026-05-25', score: 44 },
  { word: 'baggage',      ipa: '/ˈbæɡɪdʒ/',           ko: '수하물, 짐',           miss: 2, weak: '속도', scenario: 'airport',    added: '2026-05-25', score: 47 },
  { word: 'complimentary',ipa: '/ˌkɒmplɪˈmentəri/',   ko: '무료의',               miss: 2, weak: '억양', scenario: 'hotel',      added: '2026-05-24', score: 46 },
  { word: 'allergic',     ipa: '/əˈlɜːdʒɪk/',         ko: '알레르기가 있는',      miss: 2, weak: '발음', scenario: 'hospital',   added: '2026-05-24', score: 43 },
  { word: 'prescription', ipa: '/prɪˈskrɪpʃn/',       ko: '처방전',               miss: 1, weak: '속도', scenario: 'hospital',   added: '2026-05-23', score: 49 },
  { word: 'reservation',  ipa: '/ˌrezəˈveɪʃn/',       ko: '예약',                 miss: 1, weak: '억양', scenario: 'restaurant', added: '2026-05-22', score: 48 },
];

export const TRANSCRIPTS: TranscriptEntry[] = [
  { id: 't1', scenario: 'airport',    date: '2026-05-26', score: 79, lines: [['Mimic', "Good morning! May I see your passport and ticket, please?"], ['Me', "Yes, here you are. I have a flight to New York at 1 PM."], ['Mimic', "Great. Do you have any baggage to check in today?"], ['Me', "Just one suitcase. Here's my passport."]] },
  { id: 't2', scenario: 'restaurant', date: '2026-05-25', score: 85, lines: [['Mimic', "Hi there, welcome! Do you have a reservation?"], ['Me', "No, just a table for two, please."], ['Mimic', "Of course, right this way. Here are your menus."]] },
  { id: 't3', scenario: 'hotel',      date: '2026-05-24', score: 72, lines: [['Mimic', "Good evening, welcome to The Maple Hotel!"], ['Me', "Hi, I have a reservation under Sohee Kim."], ['Mimic', "Found it! You're in room 504. Enjoy your stay."]] },
  { id: 't4', scenario: 'shopping',   date: '2026-05-22', score: 81, lines: [['Mimic', "Hello! Are you looking for anything in particular?"], ['Me', "Yes, do you have this jacket in a medium?"], ['Mimic', "Let me check the back for you, one moment!"]] },
  { id: 't5', scenario: 'hospital',   date: '2026-05-21', score: 68, lines: [['Mimic', "What seems to be the problem today?"], ['Me', "I've had a sore throat and a headache since Monday."], ['Mimic', "I see. Let me take a look. Any fever?"]] },
];

export const RANKING: RankingUser[] = [
  { rank: 1, name: 'fluent_jin',  score: 97, you: false },
  { rank: 2, name: 'english_pro', score: 94, you: false },
  { rank: 3, name: 'mimic_fan',   score: 91, you: false },
  { rank: 4, name: 'sohee',       score: 88, you: true  },
  { rank: 5, name: 'speak_wow',   score: 86, you: false },
  { rank: 6, name: 'hello123',    score: 83, you: false },
  { rank: 7, name: 'daily_eng',   score: 80, you: false },
  { rank: 8, name: 'leo_kim',     score: 77, you: false },
];

export const VOICE_FEED: VoiceFeedItem[] = [
  { name: 'fluent_jin',  scenario: 'interview',  ko: '취업 면접',  line: "I'd describe myself as detail-oriented and a fast learner.", claps: 42, comments: 8, dur: 6 },
  { name: 'english_pro', scenario: 'airport',    ko: '공항',       line: "I'd like to check in two bags for my flight to Boston.",    claps: 31, comments: 4, dur: 5 },
  { name: 'mimic_fan',   scenario: 'restaurant', ko: '레스토랑',   line: "Could we get the bill whenever you have a moment?",          claps: 27, comments: 6, dur: 4 },
  { name: 'speak_wow',   scenario: 'hotel',      ko: '호텔',       line: "Is breakfast included with the room rate?",                  claps: 19, comments: 2, dur: 4 },
];

export const USER: UserProfile = {
  name: 'sohee',
  email: 'ttohee1275@gmail.com',
  streak: 7,
  level: 'mid',
  joined: '2026-04-12',
};

export const STATS: UserStats = {
  totalSessions: 42,
  avgScore: 88,
  wordsLearned: 156,
  longestStreak: 12,
  week: [true, true, true, false, true, true, false],
};
