export type Level = 'beg' | 'mid' | 'adv';

export interface Scenario {
  id: string;
  en: string;
  ko: string;
  level: Level;
  desc: string;
  icon: string;
  role: string;
  roleKo: string;
  opener: string;
}

export interface LevelInfo {
  ko: string;
  cls: string;
  color: string;
}

export interface NavItem {
  id: string;
  ko: string;
  icon: string;
}

export interface VocabWord {
  word: string;
  ipa: string;
  ko: string;
  miss: number;
  weak: string;
  scenario: string;
  added: string;
  score: number;
}

export interface TranscriptEntry {
  id: string;
  scenario: string;
  date: string;
  score: number;
  lines: [string, string][];
}

export interface RankingUser {
  rank: number;
  name: string;
  score: number;
  you: boolean;
}

export interface VoiceFeedItem {
  name: string;
  scenario: string;
  ko: string;
  line: string;
  claps: number;
  comments: number;
  dur: number;
}

export interface UserProfile {
  name: string;
  email: string;
  streak: number;
  level: Level;
  joined: string;
}

export interface UserStats {
  totalSessions: number;
  avgScore: number;
  wordsLearned: number;
  longestStreak: number;
  week: boolean[];
}

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  confidence?: number; // STT 신뢰도 0-1 (음성 입력 시만 존재)
}

export interface WeakWord {
  word: string;
  native: string;
  mine: string;
  weak: string;
  ko: string;
  score: number;
}

export interface ResultData {
  overall: number;
  accuracy: number;
  intonation: number;
  speed: number;
  lines: { text: string; score: number }[];
  weak: WeakWord[];
}

export type ViewType =
  | 'landing' | 'auth' | 'home' | 'chat'
  | 'result'  | 'vocab' | 'transcript'
  | 'ranking' | 'mypage';

export interface TweakState {
  brandHue: number;
  fontKr: string;
  sidebar: 'dark' | 'light';
  roundness: number;
  difficulty: 'classic' | 'cool';
  homeLayout: 'level' | 'grid';
}
