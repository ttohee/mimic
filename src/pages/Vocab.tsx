import { useState, useRef } from 'react';
import { Icon, ScoreRing, PageHead } from '../components/Shell';
import { speakEN } from '../lib/speech';
import type { VocabWord } from '../types';

interface Props { words: VocabWord[]; onMaster: (w: VocabWord) => void; onMiss: (w: VocabWord) => void; }

const MASTER_CUTOFF = 70;

/* ── Pronunciation scoring ─────────────────────────────────── */

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function scorePronunciation(heard: string, target: string, confidence: number): number {
  // Normalise: strip punctuation, lowercase
  const h = heard.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  const t = target.toLowerCase().trim();
  // Find best matching word in heard text (user may say a phrase)
  const heardWords = h.split(/\s+/);
  const bestSim = heardWords.reduce((best, w) => {
    const dist = levenshtein(w, t);
    const maxLen = Math.max(w.length, t.length) || 1;
    return Math.max(best, 1 - dist / maxLen);
  }, 0);
  // 60 % string similarity + 40 % STT confidence (Safari returns 0 → default 0.7)
  const conf = confidence > 0 ? confidence : 0.7;
  const raw = bestSim * 60 + conf * 40;
  return Math.round(Math.max(15, Math.min(100, raw)));
}

/* ── Drill ─────────────────────────────────────────────────── */

function Drill({
  word, onClose, onMaster, onMiss,
}: {
  word: VocabWord;
  onClose: () => void;
  onMaster: (w: VocabWord) => void;
  onMiss: (w: VocabWord) => void;
}) {
  const [phase, setPhase] = useState<'idle' | 'listening' | 'scoring' | 'done'>('idle');
  const [score, setScore] = useState<number | null>(null);
  const [heard, setHeard]   = useState('');
  const recRef = useRef<unknown>(null);
  const passed = score != null && score >= MASTER_CUTOFF;

  function record() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('음성 인식을 지원하지 않는 브라우저예요. Chrome을 사용해주세요.');
      return;
    }
    let gotResult = false;
    setPhase('listening');
    setHeard('');
    setScore(null);

    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      gotResult = true;
      const result = e.results[0][0];
      const transcript = result.transcript.trim();
      const confidence = (result as unknown as { confidence: number }).confidence || 0;
      setHeard(transcript);
      setPhase('scoring');
      setTimeout(() => {
        setScore(scorePronunciation(transcript, word.word, confidence));
        setPhase('done');
      }, 700);
    };
    rec.onerror = () => { setPhase('idle'); };
    rec.onend   = () => { if (!gotResult) setPhase('idle'); };
    recRef.current = rec;
    rec.start();
  }

  function retry() { setPhase('idle'); setScore(null); setHeard(''); }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,42,25,.45)', backdropFilter: 'blur(3px)', display: 'grid', placeItems: 'center', zIndex: 60, padding: 24 }}>
      <div onClick={e => e.stopPropagation()} className="card popIn" style={{ width: 480, padding: '30px 32px', borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-lg)', textAlign: 'center', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'var(--bg)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', color: 'var(--text-3)', display: 'grid', placeItems: 'center' }}>
          <Icon name="x" size={16} />
        </button>

        <div className="badge badge-streak" style={{ marginBottom: 14 }}><Icon name="flag" size={12} /> 발음 드릴</div>
        <h2 style={{ fontSize: 34, margin: '0 0 6px', fontWeight: 800, letterSpacing: '-0.02em' }}>{word.word}</h2>
        <div style={{ fontSize: 17, color: 'var(--brand-strong)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>{word.ipa}</div>
        <div style={{ fontSize: 15, color: 'var(--text-2)' }}>{word.ko}</div>

        <button className="btn btn-ghost btn-md" style={{ margin: '18px auto 0' }} onClick={() => speakEN(word.word)}>
          <Icon name="speaker" size={18} /> 원어민 발음 듣기
        </button>

        <div style={{ marginTop: 24, minHeight: 160, display: 'grid', placeItems: 'center' }}>
          {phase === 'idle' && (
            <div>
              <button onClick={record} style={{ width: 80, height: 80, borderRadius: '50%', border: 'none', background: 'var(--brand-500)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: 'var(--sh-brand)', margin: '0 auto' }}>
                <Icon name="mic" size={34} />
              </button>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 12 }}>버튼을 누르고 단어를 말해보세요</div>
            </div>
          )}

          {phase === 'listening' && (
            <div>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--lv-adv)', color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto', animation: 'pulseRing 1.3s infinite' }}>
                <Icon name="mic" size={34} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 12 }}>듣고 있어요… 단어를 또렷하게 말해보세요</div>
            </div>
          )}

          {phase === 'scoring' && (
            <div style={{ fontSize: 14, color: 'var(--text-3)' }}>
              <div style={{ marginBottom: 8 }}>발음 분석 중…</div>
              {heard && <div style={{ fontSize: 13, color: 'var(--brand-strong)' }}>인식된 발음: &ldquo;{heard}&rdquo;</div>}
            </div>
          )}

          {phase === 'done' && (
            <div style={{ animation: 'popIn .4s ease', width: '100%' }}>
              <ScoreRing score={score!} size={110} />

              {/* 원어민 vs 내 발음 비교 */}
              {heard && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '14px 0 4px' }}>
                  <div style={{ background: 'var(--lv-adv-bg)', borderRadius: 'var(--r-xs)', padding: '6px 10px' }}>
                    <div style={{ fontSize: 10, color: '#cf443c', fontWeight: 700 }}>인식된 내 발음</div>
                    <div style={{ fontSize: 13, color: '#cf443c', marginTop: 2 }}>{heard}</div>
                  </div>
                  <div style={{ background: 'var(--lv-beg-bg)', borderRadius: 'var(--r-xs)', padding: '6px 10px' }}>
                    <div style={{ fontSize: 10, color: '#138a13', fontWeight: 700 }}>원어민 발음 기호</div>
                    <div style={{ fontSize: 13, color: '#138a13', marginTop: 2 }}>{word.ipa}</div>
                  </div>
                </div>
              )}

              {passed ? (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 800, color: 'var(--score-hi)', fontSize: 16 }}>마스터 완료! 🎉</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 3 }}>{MASTER_CUTOFF}점을 넘어 단어장에서 제거돼요</div>
                  <button className="btn btn-primary btn-md" style={{ marginTop: 14 }} onClick={() => onMaster(word)}>완료</button>
                </div>
              ) : (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 700, color: 'var(--score-mid)', fontSize: 14 }}>{MASTER_CUTOFF}점 이상이면 마스터</div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => onMiss(word)}>나중에</button>
                    <button className="btn btn-primary btn-sm" onClick={retry}>다시 시도</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Flashcards ────────────────────────────────────────────── */

function Flashcards({ words }: { words: VocabWord[] }) {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  if (!words.length) return null;
  const w = words[i % words.length];
  function go(d: number) { setFlip(false); setI(v => (v + d + words.length) % words.length); }
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: '20px 0' }}>
      <div onClick={() => setFlip(f => !f)} style={{ width: 460, height: 260, cursor: 'pointer', perspective: 1000 }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', transition: 'transform .5s', transformStyle: 'preserve-3d', transform: flip ? 'rotateY(180deg)' : 'none' }}>
          <div className="card" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'grid', placeItems: 'center', borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-md)' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 38, margin: 0, fontWeight: 800 }}>{w.word}</h2>
              <div style={{ color: 'var(--brand-strong)', fontFamily: 'var(--font-display)', fontSize: 18, marginTop: 6 }}>{w.ipa}</div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={e => { e.stopPropagation(); speakEN(w.word); }}>
                <Icon name="speaker" size={15} /> 듣기
              </button>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 14 }}>카드를 눌러 뜻 보기</div>
            </div>
          </div>
          <div className="card" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'grid', placeItems: 'center', borderRadius: 'var(--r-xl)', background: 'var(--brand-50)', boxShadow: 'var(--sh-md)' }}>
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{w.ko}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginTop: 10 }}>틀린 횟수 {w.miss}회 · 취약 {w.weak}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => go(-1)}>← 이전</button>
        <span style={{ fontSize: 13.5, color: 'var(--text-3)', fontWeight: 600 }}>{(i % words.length) + 1} / {words.length}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => go(1)}>다음 →</button>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */

export default function Vocab({ words, onMaster, onMiss }: Props) {
  const [tab, setTab]   = useState<'list' | 'cards'>('list');
  const [q, setQ]       = useState('');
  const [sort, setSort] = useState<'miss' | 'recent'>('miss');
  const [drill, setDrill] = useState<VocabWord | null>(null);

  let list = words.filter(w => w.word.toLowerCase().includes(q.toLowerCase()) || w.ko.includes(q));
  list = [...list].sort((a, b) =>
    sort === 'miss' ? b.miss - a.miss : (b.added || '').localeCompare(a.added || ''),
  );

  return (
    <div style={{ padding: '34px 40px 60px', maxWidth: 920, margin: '0 auto' }}>
      <PageHead icon="📒" title="단어장"
        sub={`발음이 약했던 단어 ${words.length}개 · ${MASTER_CUTOFF}점을 넘기면 자동으로 마스터돼요`}
        right={
          <div className="segment">
            {([['list', '단어 목록'], ['cards', '플래시카드']] as const).map(([k, l]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
        }
      />

      {words.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: 'var(--r-lg)' }}>
          <div style={{ fontSize: 40 }}>🎉</div>
          <h3 style={{ margin: '12px 0 4px' }}>모든 단어를 마스터했어요!</h3>
          <p style={{ color: 'var(--text-3)', margin: 0 }}>회화에서 발음 50점 미만 단어가 생기면 여기에 자동으로 쌓여요.</p>
        </div>
      ) : tab === 'list' ? (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            <div className="field" style={{ flex: 1 }}>
              <span className="ic"><Icon name="search" size={18} /></span>
              <input placeholder="단어 검색" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div className="segment">
              {([['miss', '오답순'], ['recent', '최근 추가순']] as const).map(([k, l]) => (
                <button key={k} className={sort === k ? 'on' : ''} onClick={() => setSort(k)}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map((w, i) => (
              <button key={w.word} onClick={() => setDrill(w)} className="card"
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '15px 20px', borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'left', transition: 'transform .14s, box-shadow .14s', animation: `fadeUp .4s ${i * 0.03}s` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-sm)'; }}>
                <span onClick={e => { e.stopPropagation(); speakEN(w.word); }}
                  style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-50)', color: 'var(--brand-strong)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="speaker" size={18} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <b style={{ fontSize: 16.5 }}>{w.word}</b>
                    <span style={{ color: 'var(--brand-strong)', fontSize: 13.5, fontFamily: 'var(--font-display)' }}>{w.ipa}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-3)', marginTop: 2 }}>{w.ko}</div>
                </div>
                <span className="badge badge-adv">{w.miss}회 틀림</span>
                <Icon name="arrow" size={17} style={{ color: 'var(--text-3)' }} />
              </button>
            ))}
          </div>
        </>
      ) : (
        <Flashcards words={words} />
      )}

      {drill && (
        <Drill
          word={drill}
          onClose={() => setDrill(null)}
          onMaster={w => { onMaster(w); setDrill(null); }}
          onMiss={w => { onMiss(w); setDrill(null); }}
        />
      )}
    </div>
  );
}
