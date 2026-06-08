/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import type { TranscriptEntry, VocabWord } from '../types';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

/* ── Transcripts ──────────────────────────────────────────── */

export async function saveTranscript(userId: string, entry: TranscriptEntry) {
  const { error } = await supabase.from('transcripts').upsert({
    id: entry.id,
    user_id: userId,
    scenario: entry.scenario,
    date: entry.date,
    score: entry.score,
    lines: entry.lines,
  });
  if (error) console.warn('[supabase] saveTranscript:', error.message);
  return error;
}

export async function loadTranscripts(userId: string): Promise<TranscriptEntry[]> {
  const { data, error } = await supabase
    .from('transcripts')
    .select('id, scenario, date, score, lines')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(50);
  if (error) { console.warn('[supabase] loadTranscripts:', error.message); return []; }
  return (data ?? []).map(r => ({
    id: r.id as string,
    scenario: r.scenario as string,
    date: r.date as string,
    score: r.score as number,
    lines: r.lines as [string, string][],
  }));
}

/* ── Vocab ────────────────────────────────────────────────── */

export async function upsertVocab(userId: string, word: VocabWord) {
  const { error } = await supabase.from('vocab_words').upsert(
    { ...word, user_id: userId },
    { onConflict: 'user_id,word' },
  );
  if (error) console.warn('[supabase] upsertVocab:', error.message);
  return error;
}

export async function deleteVocabWord(userId: string, word: string) {
  const { error } = await supabase
    .from('vocab_words')
    .delete()
    .eq('user_id', userId)
    .eq('word', word);
  if (error) console.warn('[supabase] deleteVocabWord:', error.message);
}

export async function loadVocab(userId: string): Promise<VocabWord[]> {
  const { data, error } = await supabase
    .from('vocab_words')
    .select('word, ipa, ko, miss, weak, scenario, added, score')
    .eq('user_id', userId)
    .order('added', { ascending: false });
  if (error) { console.warn('[supabase] loadVocab:', error.message); return []; }
  return (data ?? []) as VocabWord[];
}

/* ── Transcript delete ────────────────────────────────────── */

export async function deleteTranscript(userId: string, id: string) {
  const { error } = await supabase
    .from('transcripts')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);
  if (error) console.warn('[supabase] deleteTranscript:', error.message);
}

/* ── Profiles (leaderboard) ───────────────────────────────── */

export interface LeaderboardEntry {
  user_id: string;
  nickname: string;
  avg_score: number;
  total_sessions: number;
}

export interface FeedEntry {
  nickname: string;
  best_scenario: string;
  best_line: string;
}

export async function upsertProfile(
  userId: string,
  nickname: string,
  avgScore: number,
  totalSessions: number,
  bestLine?: string,
  bestScenario?: string,
) {
  const row: Record<string, unknown> = {
    user_id: userId, nickname, avg_score: avgScore,
    total_sessions: totalSessions, updated_at: new Date().toISOString(),
  };
  if (bestLine) { row.best_line = bestLine; row.best_scenario = bestScenario ?? ''; }
  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'user_id' });
  if (error) console.warn('[supabase] upsertProfile:', error.message);
}

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, nickname, avg_score, total_sessions')
    .gt('total_sessions', 0)
    .order('avg_score', { ascending: false })
    .limit(20);
  if (error) { console.warn('[supabase] loadLeaderboard:', error.message); return []; }
  return (data ?? []) as LeaderboardEntry[];
}

export async function loadFeed(): Promise<FeedEntry[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('nickname, best_line, best_scenario')
    .not('best_line', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(10);
  if (error) { console.warn('[supabase] loadFeed:', error.message); return []; }
  return (data ?? []).filter(r => r.best_line) as FeedEntry[];
}
