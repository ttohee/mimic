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
import { VOCAB_SEED } from './lib/data';
import { buildResult } from './lib/result';
import {
  saveTranscript, loadTranscripts,
  upsertVocab, deleteVocabWord, loadVocab,
} from './lib/supabase';
import type { Message, ResultData, Scenario, TweakState, ViewType, VocabWord, TranscriptEntry } from './types';

/* ─── Persistence ─── */
const LS = 'mimic_state_v1';
function loadState() {
  try { return JSON.parse(localStorage.getItem(LS) ?? '{}') as Partial<{ view: ViewType; words: VocabWord[]; transcripts: TranscriptEntry[]; notif: boolean }>; }
  catch { return {}; }
}
function saveState(s: object) { try { localStorage.setItem(LS, JSON.stringify(s)); } catch { /* noop */ } }

/* ─── CSS variable helpers ─── */
function applyBrand(hue: number) {
  const r = document.documentElement;
  const steps: Record<string, [number, number]> = { '50': [0.97, 0.03], '100': [0.93, 0.08], '200': [0.88, 0.13], '300': [0.81, 0.18], '400': [0.75, 0.20], '500': [0.69, 0.21], '600': [0.60, 0.19], '700': [0.50, 0.16] };
  for (const k in steps) r.style.setProperty(`--brand-${k}`, `oklch(${steps[k][0]} ${steps[k][1]} ${hue})`);
  r.style.setProperty('--brand-ink',    `oklch(0.34 0.10 ${hue})`);
  r.style.setProperty('--brand',        `oklch(0.69 0.21 ${hue})`);
  r.style.setProperty('--brand-strong', `oklch(0.58 0.19 ${hue})`);
  r.style.setProperty('--score-hi',     `oklch(0.66 0.20 ${hue})`);
  r.style.setProperty('--lv-beg',       `oklch(0.69 0.21 ${hue})`);
  r.style.setProperty('--lv-beg-bg',    `oklch(0.96 0.04 ${hue})`);
  r.style.setProperty('--side-active-text', `oklch(0.80 0.18 ${hue})`);
  r.style.setProperty('--side-active-bg',   `oklch(0.69 0.21 ${hue} / 0.16)`);
}
function applySidebar(theme: string, hue: number) {
  const r = document.documentElement;
  if (theme === 'dark') {
    r.style.setProperty('--side-bg',       `oklch(0.24 0.045 ${hue})`);
    r.style.setProperty('--side-bg-2',     `oklch(0.18 0.04 ${hue})`);
    r.style.setProperty('--side-text',     `oklch(0.85 0.03 ${hue})`);
    r.style.setProperty('--side-text-dim', `oklch(0.62 0.03 ${hue})`);
    r.style.setProperty('--side-border',   'rgba(255,255,255,0.08)');
  } else {
    r.style.setProperty('--side-bg',       '#FFFFFF');
    r.style.setProperty('--side-bg-2',     '#F4F7F3');
    r.style.setProperty('--side-text',     '#45554B');
    r.style.setProperty('--side-text-dim', '#9AA89E');
    r.style.setProperty('--side-border',   'var(--border)');
  }
}

/* ─── useTweaks ─── */
function useTweaks(defaults: TweakState): [TweakState, <K extends keyof TweakState>(k: K, v: TweakState[K]) => void] {
  const [state, setState] = useState(defaults);
  const set = <K extends keyof TweakState>(k: K, v: TweakState[K]) => setState(s => ({ ...s, [k]: v }));
  return [state, set];
}

const TWEAK_DEFAULTS: TweakState = { brandHue: 145, fontKr: 'Noto Sans KR', sidebar: 'dark', roundness: 1, difficulty: 'classic', homeLayout: 'level' };
const HUE_SWATCHES = [{ v: 145, label: '그린' }, { v: 165, label: '민트' }, { v: 230, label: '블루' }, { v: 285, label: '바이올렛' }, { v: 25, label: '코랄' }];

/* ─── Tweaks panel components ─── */
function TPanel({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 9999 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: '8px 0 0 8px', border: 'none', background: 'var(--brand-500)', color: '#fff', cursor: 'pointer', fontSize: 18, display: 'grid', placeItems: 'center', boxShadow: 'var(--sh-md)' }}>⚙</button>
      {open && (
        <div style={{ position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, width: 270, boxShadow: 'var(--sh-lg)', maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, color: 'var(--text)' }}>{title}</div>
          {children}
        </div>
      )}
    </div>
  );
}
function TSection({ label }: { label: string }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '14px 0 6px' }}>{label}</div>;
}
function TSlider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4, color: 'var(--text-2)' }}><span>{label}</span><span style={{ fontWeight: 700 }}>{value}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand-500)' }} />
    </div>
  );
}
function TRadio({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 5 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {options.map(o => <button key={o} onClick={() => onChange(o)} style={{ padding: '5px 12px', fontSize: 12.5, borderRadius: 999, border: '1px solid var(--border)', background: value === o ? 'var(--brand-500)' : 'transparent', color: value === o ? '#fff' : 'var(--text)', cursor: 'pointer', transition: 'all .15s' }}>{o}</button>)}
      </div>
    </div>
  );
}
function TSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 5 }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13.5, color: 'var(--text)', background: 'var(--surface)' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ─── App ─── */
export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const authed = !!user;

  const persisted = useRef(loadState()).current;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [view, setView]       = useState<ViewType>(persisted.view ?? 'landing');
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [result, setResult]     = useState<ResultData | null>(null);
  const [addedWords, setAddedWords] = useState<string[]>([]);

  const [words, setWords] = useState<VocabWord[]>(persisted.words ?? VOCAB_SEED);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>(persisted.transcripts ?? []);
  const [notif, setNotif] = useState(persisted.notif ?? true);

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
    loadTranscripts(user.id).then(rows => {
      if (rows.length > 0) setTranscripts(rows);
    });
    loadVocab(user.id).then(rows => {
      if (rows.length > 0) setWords(rows);
    });
  }, [user?.id]);

  useEffect(() => { applyBrand(t.brandHue); }, [t.brandHue]);
  useEffect(() => { applySidebar(t.sidebar, t.brandHue); }, [t.sidebar, t.brandHue]);
  useEffect(() => { document.documentElement.style.setProperty('--r-scale', String(t.roundness)); }, [t.roundness]);
  useEffect(() => {
    document.documentElement.style.setProperty('--font-kr', `'${t.fontKr}', sans-serif`);
    document.documentElement.style.setProperty('--font-body', `'${t.fontKr}', sans-serif`);
  }, [t.fontKr]);

  /* ── localStorage 동기화 ── */
  useEffect(() => {
    saveState({
      view: ['chat', 'result'].includes(view) ? 'home' : view,
      words,
      transcripts: transcripts.slice(0, 30), // keep latest 30
      notif,
    });
  }, [view, words, transcripts, notif]);

  const go = (v: ViewType) => { setView(v); window.scrollTo(0, 0); };
  const startAuth = (tab: 'login' | 'signup') => { setAuthTab(tab); setView('auth'); };
  const onAuthed  = () => go('home');
  const logout    = () => { signOut(); setView('landing'); };
  const pickScenario = (s: Scenario) => { setScenario(s); go('chat'); };

  /* ── 대화 종료 ── */
  function endChat(msgs: Message[], s: Scenario) {
    const r = buildResult(msgs, s);
    setResult(r);

    // 발음 50점 미만 → 단어장 자동 추가
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

    // Supabase에 신규 단어 저장
    if (user && newWords.length > 0) {
      newWords.forEach(w => upsertVocab(user.id, w));
    }

    // 대본 저장
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
      setWords(VOCAB_SEED);
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

  const tweaksUI = (
    <TPanel title="Tweaks">
      <TSection label="브랜드" />
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, fontWeight: 600 }}>메인 컬러</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {HUE_SWATCHES.map(sw => (
            <button key={sw.v} onClick={() => setTweak('brandHue', sw.v)} title={sw.label}
              style={{ width: 34, height: 34, borderRadius: 10, cursor: 'pointer', background: `oklch(0.69 0.21 ${sw.v})`, border: t.brandHue === sw.v ? '3px solid var(--text)' : '3px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,.18)' }} />
          ))}
        </div>
      </div>
      <TSelect label="한글 폰트" value={t.fontKr} options={['Noto Sans KR', 'Gowun Dodum', 'IBM Plex Sans KR', 'Jua']} onChange={v => setTweak('fontKr', v)} />
      <TSection label="레이아웃" />
      <TRadio label="사이드바" value={t.sidebar} options={['dark', 'light']} onChange={v => setTweak('sidebar', v as 'dark' | 'light')} />
      <TRadio label="홈 정렬" value={t.homeLayout} options={['level', 'grid']} onChange={v => setTweak('homeLayout', v as 'level' | 'grid')} />
      <TSlider label="모서리 둥글기" value={t.roundness} min={0.5} max={1.6} step={0.1} onChange={v => setTweak('roundness', v)} />
    </TPanel>
  );

  /* Full-page views (no sidebar) */
  if (view === 'landing' || (!authed && view !== 'auth')) return <><Landing go={go} onStart={startAuth} />{tweaksUI}</>;
  if (view === 'auth') return <><Auth initialTab={authTab} onAuthed={onAuthed} go={go} />{tweaksUI}</>;

  /* Shell views */
  let content: React.ReactNode;
  if      (view === 'home')                  content = <Home go={go} onPick={pickScenario} homeLayout={t.homeLayout} />;
  else if (view === 'chat' && scenario)      content = <Chat scenario={scenario} go={go} onEnd={endChat} />;
  else if (view === 'result' && result)      content = <Result data={result} scenario={scenario!} go={go} addedWords={addedWords} onRetry={() => go('chat')} />;
  else if (view === 'vocab')                 content = <Vocab words={words} onMaster={masterWord} onMiss={missWord} />;
  else if (view === 'transcript')            content = <Transcript go={go} transcripts={transcripts} />;
  else if (view === 'ranking')               content = <Ranking />;
  else if (view === 'mypage')                content = <MyPage go={go} notif={notif} setNotif={setNotif} onReset={resetData} vocabCount={words.length} transcripts={transcripts} words={words} />;
  else                                       content = <Home go={go} onPick={pickScenario} homeLayout={t.homeLayout} />;

  const sidebarView = (['chat', 'result'] as ViewType[]).includes(view) ? 'home' : view;

  return (
    <>
      <div className="app-shell">
        <Sidebar view={sidebarView as ViewType} go={go} onLogout={logout} />
        <main className="app-main">{content}</main>
      </div>
      {tweaksUI}
    </>
  );
}
