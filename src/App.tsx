import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Shell';
import { useAuth } from './context/AuthContext';
import Landing    from './pages/Landing';
import Auth       from './pages/Auth';
import Home       from './pages/Home';
import Chat       from './pages/Chat';
import Result     from './pages/Result';
import Vocab      from './pages/Vocab';
import Transcript from './pages/Transcript';
import Ranking    from './pages/Ranking';
import MyPage     from './pages/MyPage';
import { buildResult } from './lib/result';
import {
  saveTranscript, loadTranscripts,
  upsertVocab, deleteVocabWord, loadVocab,
} from './lib/supabase';
import type { Message, ResultData, Scenario, ViewType, VocabWord, TranscriptEntry } from './types';

/* ─── Persistence ─── */
const LS = 'mimic_state_v1';
function loadState() {
  try {
    return JSON.parse(localStorage.getItem(LS) ?? '{}') as Partial<{
      view: ViewType;
      words: VocabWord[];
      transcripts: TranscriptEntry[];
      notif: boolean;
      darkMode: boolean;
    }>;
  } catch { return {}; }
}
function saveState(s: object) { try { localStorage.setItem(LS, JSON.stringify(s)); } catch { /* noop */ } }

/* ─── App ─── */
export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const authed = !!user;

  const persisted = useRef(loadState()).current;

  const [view, setView]       = useState<ViewType>(persisted.view ?? 'landing');
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [result, setResult]     = useState<ResultData | null>(null);
  const [addedWords, setAddedWords] = useState<string[]>([]);

  const [words, setWords]           = useState<VocabWord[]>(persisted.words ?? []);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>(persisted.transcripts ?? []);
  const [notif, setNotif]           = useState(persisted.notif ?? true);
  const [darkMode, setDarkMode]     = useState(persisted.darkMode ?? false);

  /* ── 다크 모드 적용 ── */
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : '';
  }, [darkMode]);

  /* ── Supabase 세션 복원 시 홈으로 이동 ── */
  useEffect(() => {
    if (!authLoading) {
      if (authed && (view === 'landing' || view === 'auth')) setView('home');
      if (!authed && view !== 'landing' && view !== 'auth') setView('landing');
    }
  }, [authed, authLoading]);

  /* ── 로그인 시 Supabase DB에서 데이터 불러오기 ── */
  useEffect(() => {
    if (!user) return;
    // Supabase를 진실의 원천으로 사용 — 항상 덮어씀 (localStorage 더미값 제거)
    loadTranscripts(user.id).then(rows => setTranscripts(rows));
    loadVocab(user.id).then(rows => setWords(rows));
  }, [user?.id]);

  /* ── localStorage 동기화 ── */
  useEffect(() => {
    saveState({
      view: ['chat', 'result'].includes(view) ? 'home' : view,
      words,
      transcripts: transcripts.slice(0, 30),
      notif,
      darkMode,
    });
  }, [view, words, transcripts, notif, darkMode]);

  const go = (v: ViewType) => { setView(v); window.scrollTo(0, 0); };
  const startAuth = (tab: 'login' | 'signup') => { setAuthTab(tab); setView('auth'); };
  const onAuthed  = () => go('home');
  const logout    = () => { signOut(); setView('landing'); };
  const pickScenario = (s: Scenario) => { setScenario(s); go('chat'); };

  /* ── 대화 종료 ── */
  function endChat(msgs: Message[], s: Scenario) {
    const userMsgs = msgs.filter(m => m.role === 'user');
    if (userMsgs.length === 0) {
      go('home');
      return;
    }
    const r = buildResult(msgs, s);
    setResult(r);

    const toAdd = r.weak.filter(w => w.score < 50);
    const newWords: VocabWord[] = [];
    setWords(prev => {
      const have = new Set(prev.map(p => p.word));
      const add: VocabWord[] = toAdd
        .filter(w => !have.has(w.word))
        .map(w => ({
          word: w.word, ipa: w.native, ko: w.ko, miss: 1,
          weak: w.weak, scenario: s.id,
          added: new Date().toISOString().slice(0, 10),
          score: w.score,
        }));
      newWords.push(...add);
      return [...add, ...prev];
    });
    setAddedWords(toAdd.map(w => w.word));
    if (user && newWords.length > 0) {
      newWords.forEach(w => upsertVocab(user.id, w));
    }

    const entry: TranscriptEntry = {
      id: `t_${Date.now()}`,
      scenario: s.id,
      date: new Date().toISOString().slice(0, 10),
      score: r.overall,
      lines: msgs.map(m => [m.role === 'assistant' ? 'Mimic' : 'Me', m.text]),
    };
    setTranscripts(prev => [entry, ...prev]);
    if (user) saveTranscript(user.id, entry);

    go('result');
  }

  /* ── 단어장 마스터 / 오답 ── */
  function masterWord(w: VocabWord) {
    setWords(prev => prev.filter(x => x.word !== w.word));
    if (user) deleteVocabWord(user.id, w.word);
  }
  function missWord(w: VocabWord) {
    setWords(prev => prev.map(x => {
      if (x.word !== w.word) return x;
      const updated = { ...x, miss: x.miss + 1 };
      if (user) upsertVocab(user.id, updated);
      return updated;
    }));
  }

  function resetData() {
    if (confirm('학습 데이터를 모두 초기화할까요?')) {
      setWords([]);
      setTranscripts([]);
      localStorage.removeItem(LS);
    }
  }

  /* ── 로딩 스피너 ── */
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
          <div style={{ width: 44, height: 44, border: '4px solid var(--brand-200)', borderTopColor: 'var(--brand-500)', borderRadius: '50%', margin: '0 auto 14px', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 14, fontWeight: 600 }}>로딩 중…</div>
        </div>
      </div>
    );
  }

  /* Full-page views */
  if (view === 'landing' || (!authed && view !== 'auth')) return <Landing go={go} onStart={startAuth} />;
  if (view === 'auth') return <Auth initialTab={authTab} onAuthed={onAuthed} go={go} />;

  /* Shell views */
  let content: React.ReactNode;
  if      (view === 'home')               content = <Home go={go} onPick={pickScenario} homeLayout="level" />;
  else if (view === 'chat' && scenario)   content = <Chat scenario={scenario} go={go} onEnd={endChat} />;
  else if (view === 'result' && result)   content = <Result data={result} scenario={scenario!} go={go} addedWords={addedWords} onRetry={() => go('chat')} />;
  else if (view === 'vocab')              content = <Vocab words={words} onMaster={masterWord} onMiss={missWord} />;
  else if (view === 'transcript')         content = <Transcript go={go} transcripts={transcripts} />;
  else if (view === 'ranking')            content = <Ranking />;
  else if (view === 'mypage')             content = <MyPage go={go} notif={notif} setNotif={setNotif} onReset={resetData} vocabCount={words.length} transcripts={transcripts} words={words} />;
  else                                    content = <Home go={go} onPick={pickScenario} homeLayout="level" />;

  const sidebarView = (['chat', 'result'] as ViewType[]).includes(view) ? 'home' : view;

  return (
    <div className="app-shell">
      <Sidebar view={sidebarView as ViewType} go={go} onLogout={logout} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
      <main className="app-main">{content}</main>
    </div>
  );
}
