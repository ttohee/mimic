import { useState, useEffect, useRef } from 'react';
import { Icon, LogoMark, levelBadge } from '../components/Shell';
import { speakEN } from '../lib/speech';
import { claudeComplete } from '../lib/ai';
import type { Message, Scenario, ViewType } from '../types';

interface Props { scenario: Scenario; go: (v: ViewType) => void; onEnd: (msgs: Message[], s: Scenario) => void; }

/* ── 유틸 ─────────────────────────────────────────────── */

// 스크립트 vs STT 결과 단어 단위 비교
function scoreText(target: string, spoken: string) {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9'\s]/g, '').trim();
  const tw = clean(target).split(/\s+/).filter(Boolean);
  const sw = clean(spoken).split(/\s+/).filter(Boolean);
  const words = tw.map((word, i) => ({ word, correct: sw[i] === word }));
  const score = tw.length ? Math.round(words.filter(w => w.correct).length / tw.length * 100) : 0;
  return { score, words };
}

// AI 응답에서 SCRIPT / KO / Tip 태그 파싱
function parseReply(text: string) {
  const scriptMatch = text.match(/\[SCRIPT:\s*([\s\S]+?)\]/i);
  const koMatch     = text.match(/\[KO:\s*([\s\S]+?)\]/i);
  const tipMatch    = text.match(/\(Tip:\s*([^)]+)\)/i);
  const main = text
    .replace(/\[SCRIPT:[\s\S]+?\]/gi, '')
    .replace(/\[KO:[\s\S]+?\]/gi, '')
    .replace(/\[OPT:[\s\S]+?\]/gi, '')
    .replace(/\(Tip:[^)]+\)/gi, '')
    .trim();
  return {
    main,
    script: scriptMatch?.[1].trim() ?? '',
    ko:     koMatch?.[1].trim()     ?? '',
    tip:    tipMatch?.[1].trim()    ?? '',
  };
}

// 레벨별 스크립트 난이도 지침
function scriptGuide(level: string) {
  if (level === 'beg')
    return 'Use only simple, common words (A1-A2). Keep it 5-8 words. Avoid difficult sounds like "th", "r/l", or consonant clusters.';
  if (level === 'mid')
    return 'Use intermediate vocabulary (B1). 8-12 words. Include some challenging sounds: "th" (the, that, through), "r/l" pairs, vowel clusters. Vary the sentence structure.';
  return 'Use advanced vocabulary (B2+). 10-15 words. Deliberately include phonetically difficult words such as "particularly", "comfortable", "specifically", "rural", "literally", "thoroughly", "worcestershire". Use formal register and complex sentences.';
}

/* ── 컴포넌트 ─────────────────────────────────────────── */

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '4px 2px' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-400)', animation: `floatY 1s ease-in-out ${i * 0.15}s infinite` }} />
      ))}
    </div>
  );
}

function Bubble({ m, autoSpeak }: { m: Message; autoSpeak: boolean }) {
  const mine = m.role === 'user';
  const tipMatch = !mine ? m.text.match(/\(Tip:\s*([^)]+)\)/i) : null;

  // 버블에서는 AI 대화 내용만 표시 (SCRIPT/KO/OPT 태그 전부 제거)
  const main = m.text
    .replace(/\[SCRIPT:[\s\S]+?\]/gi, '')
    .replace(/\[KO:[\s\S]+?\]/gi, '')
    .replace(/\[OPT:[\s\S]+?\]/gi, '')
    .replace(/\(Tip:[^)]+\)/gi, '')
    .trim();

  const didSpeak = useRef(false);
  useEffect(() => {
    if (!mine && autoSpeak && !didSpeak.current) { didSpeak.current = true; speakEN(main); }
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', gap: 10, animation: 'fadeUp .35s ease' }}>
      {!mine && (
        <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(150deg,var(--brand-300),var(--brand-600))', display: 'grid', placeItems: 'center', alignSelf: 'flex-end' }}>
          <LogoMark size={22} />
        </div>
      )}
      <div style={{ maxWidth: '72%' }}>
        <div style={{ padding: '13px 17px', fontSize: 15.5, lineHeight: 1.55, background: mine ? 'var(--brand-500)' : 'var(--surface)', color: mine ? '#fff' : 'var(--text)', border: mine ? 'none' : '1px solid var(--border)', borderRadius: mine ? 'var(--r-lg) var(--r-lg) 6px var(--r-lg)' : 'var(--r-lg) var(--r-lg) var(--r-lg) 6px', boxShadow: 'var(--sh-sm)' }}>
          {main}
          {!mine && (
            <button onClick={() => speakEN(main)} style={{ border: 'none', background: 'transparent', color: 'var(--brand-strong)', cursor: 'pointer', marginLeft: 6, verticalAlign: 'middle', padding: 2 }}>
              <Icon name="speaker" size={16} />
            </button>
          )}
        </div>
        {/* 표현 팁 */}
        {tipMatch && (
          <div style={{ marginTop: 6, padding: '8px 12px', background: 'var(--brand-50)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--brand-ink)', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <Icon name="sparkle" size={15} style={{ color: 'var(--brand-strong)', flexShrink: 0, marginTop: 1 }} />
            <span><b>표현 팁 </b>{tipMatch[1].trim()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 메인 ─────────────────────────────────────────────── */

export default function Chat({ scenario, go, onEnd }: Props) {
  const s = scenario;
  const [msgs, setMsgs]                 = useState<Message[]>([{ role: 'assistant', text: s.opener }]);
  const [thinking, setThinking]         = useState(false);
  const [listening, setListening]       = useState(false);
  const [autoSpeak, setAutoSpeak]       = useState(true);
  const [toast, setToast]               = useState('');
  const [currentScript, setCurrentScript] = useState('');
  const [scriptKo, setScriptKo]           = useState('');
  const [shadowResult, setShadowResult]   = useState<{ score: number; words: { word: string; correct: boolean }[] } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef    = useRef<any>(null);
  const scriptRef = useRef(''); // closure 안에서 최신 script 접근용

  const applyScript = (script: string, ko: string) => {
    setCurrentScript(script);
    setScriptKo(ko);
    scriptRef.current = script;
  };

  // 스크롤 자동 하단 이동
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, thinking]);

  // 오프너 TTS
  useEffect(() => {
    if (autoSpeak) { const t = setTimeout(() => speakEN(s.opener), 400); return () => clearTimeout(t); }
  }, []);

  // 오프너에 대한 첫 번째 대본 생성
  useEffect(() => {
    const system = `Given an opening line from a ${s.role} in a "${s.en}" scenario, generate a natural first response the learner should say.
Output ONLY these tags (nothing else):
[SCRIPT: the response the learner should read aloud]
${s.level === 'beg' ? '[KO: Korean translation of the SCRIPT]' : ''}

Script level guidance: ${scriptGuide(s.level)}`;

    claudeComplete([{ role: 'user', content: `Opening line: "${s.opener}"` }], system)
      .then(reply => {
        const p = parseReply(reply);
        if (p.script) applyScript(p.script, p.ko);
      })
      .catch(() => {});
  }, []);

  // 페이지 이탈 시 TTS + 마이크 즉시 중단
  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); recRef.current?.stop(); };
  }, []);

  async function send(spokenText: string) {
    const t = spokenText.trim();
    if (!t || thinking) return;

    // AI에게는 스크립트(의도한 대답)를 전송해서 대화 흐름 유지
    const scriptToSend = scriptRef.current || t;
    const next: Message[] = [...msgs, { role: 'user', text: scriptToSend }];
    setMsgs(next);
    applyScript('', '');
    setShadowResult(null);
    setThinking(true);

    try {
      const system = `You are "Mimic", a warm, friendly parrot character who is an English conversation tutor. You are role-playing as a ${s.role} in a "${s.en}" scenario (${s.desc}). The learner practices English pronunciation through shadowing.

For EVERY turn, output in this EXACT format — no exceptions:

[Your in-character reply as ${s.role}, 1-2 natural sentences]
[SCRIPT: A natural response for the learner to say next]
${s.level === 'beg' ? '[KO: Korean translation of the SCRIPT only — not of your reply]' : ''}
(Tip: Korean pronunciation or expression tip) ← optional, use once every 2-3 turns

Rules:
- Your reply must stay fully in character as ${s.role}.
- The SCRIPT must be what a customer/student would naturally say in response to YOUR reply.
- Never leave [SCRIPT:] empty.
- Script level guidance: ${scriptGuide(s.level)}`;

      const history = next.map(m => ({ role: m.role, content: m.text }));
      const reply   = await claudeComplete(history, system);
      const parsed  = parseReply(reply.trim());

      applyScript(parsed.script, parsed.ko);

      const displayText = parsed.main + (parsed.tip ? ` (Tip: ${parsed.tip})` : '');
      setMsgs(m => [...m, { role: 'assistant', text: displayText || "Sorry, could you say that again?" }]);
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: "Hmm, I didn't catch that — could you try again?" }]);
    } finally {
      setThinking(false);
    }
  }

  function toggleMic() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: (new () => any) | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setToast('이 브라우저는 음성 인식을 지원하지 않아요. Chrome을 사용해주세요.'); setTimeout(() => setToast(''), 3000); return; }
    if (listening) { recRef.current?.stop(); return; }

    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = true;
    let finalText = '';

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else           interim   += r[0].transcript;
      }
      if (interim || finalText) setToast(finalText || interim);
    };
    rec.onend = () => {
      setListening(false);
      setToast('');
      if (finalText.trim()) {
        // 스크립트 vs STT 비교 → 발음 점수
        const script = scriptRef.current;
        if (script) setShadowResult(scoreText(script, finalText));
        send(finalText);
      }
    };
    rec.onerror = () => { setListening(false); setToast(''); };
    recRef.current = rec; setListening(true); rec.start();
  }

  const scoreColor = shadowResult
    ? shadowResult.score >= 80 ? '#16a34a' : shadowResult.score >= 60 ? '#d97706' : '#dc2626'
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* 헤더 */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-3)', padding: 6 }} onClick={() => go('home')}>
            <Icon name="arrow" size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <span style={{ fontSize: 22 }}>{s.icon}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16.5 }}>{s.en} <span style={{ color: 'var(--text-3)', fontWeight: 600, fontSize: 14 }}>· {s.ko}</span></div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Mimic이 <b>{s.role}</b> 역할 중</div>
          </div>
          {levelBadge(s.level)}
        </div>
        <button className="btn btn-danger btn-sm" onClick={() => onEnd(msgs, s)}>
          <Icon name="x" size={16} /> 대화 종료
        </button>
      </div>

      {/* 상태 바 */}
      <div style={{ background: 'var(--brand-50)', padding: '8px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--brand-ink)', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: thinking ? 'var(--lv-mid)' : 'var(--brand-500)', animation: 'pulseRing 1.6s infinite' }} />
          {thinking ? 'Mimic이 생각 중…' : '대화 중'}
        </div>
        <button onClick={() => setAutoSpeak(a => !a)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12.5, color: autoSpeak ? 'var(--brand-strong)' : 'var(--text-3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="speaker" size={15} /> 자동 읽기 {autoSpeak ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg)' }}>
        {msgs.map((m, i) => <Bubble key={i} m={m} autoSpeak={autoSpeak} />)}
        {thinking && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(150deg,var(--brand-300),var(--brand-600))', display: 'grid', placeItems: 'center' }}><LogoMark size={22} /></div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '12px 16px', alignSelf: 'center' }}><TypingDots /></div>
          </div>
        )}
      </div>

      {/* 하단: 대본 + 마이크 */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '16px 28px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

          {/* 대본 박스 / 발음 결과 */}
          {(currentScript || shadowResult) && (
            <div style={{ width: '100%', maxWidth: 520, background: 'var(--brand-50)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--brand-strong)', fontWeight: 700, marginBottom: 6, letterSpacing: '0.05em' }}>
                {shadowResult ? '발음 결과' : '대본 — 따라 읽어보세요'}
              </div>

              {shadowResult ? (
                /* 발음 결과: 단어별 초록/빨강 */
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px', alignItems: 'center' }}>
                  {shadowResult.words.map((w, i) => (
                    <span key={i} style={{ padding: '2px 7px', borderRadius: 6, fontSize: 15, fontWeight: 600, background: w.correct ? '#dcfce7' : '#fee2e2', color: w.correct ? '#16a34a' : '#dc2626' }}>
                      {w.word}
                    </span>
                  ))}
                  <span style={{ marginLeft: 6, padding: '2px 12px', borderRadius: 99, background: scoreColor, color: '#fff', fontWeight: 800, fontSize: 13 }}>
                    {shadowResult.score}점
                  </span>
                </div>
              ) : (
                /* 대본 표시 */
                <>
                  <div style={{ fontSize: 15.5, color: 'var(--text)', lineHeight: 1.6, fontWeight: 500 }}>
                    {currentScript}
                  </div>
                  {scriptKo && s.level === 'beg' && (
                    <div style={{ marginTop: 5, fontSize: 12.5, color: 'var(--text-3)', fontStyle: 'italic' }}>
                      {scriptKo}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STT 중간 결과 */}
          {toast && (
            <div style={{ fontSize: 13.5, color: 'var(--brand-ink)', background: 'var(--brand-50)', padding: '6px 16px', borderRadius: 'var(--r-pill)', fontWeight: 600, maxWidth: 500, textAlign: 'center' }}>
              {`"${toast}"`}
            </div>
          )}

          <button
            onClick={toggleMic}
            style={{
              width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: listening ? 'var(--lv-adv)' : 'var(--brand-500)',
              color: '#fff', display: 'grid', placeItems: 'center',
              boxShadow: listening ? '0 0 0 0 rgba(238,90,82,0.4)' : 'var(--sh-brand)',
              animation: listening ? 'pulseRing 1.4s infinite' : 'none',
              transition: 'background .2s',
            }}
          >
            <Icon name="mic" size={32} />
          </button>
          <div style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>
            {listening
              ? '마이크를 눌러 발화 종료'
              : currentScript
                ? '대본을 읽고 마이크를 눌러 시작'
                : '마이크를 눌러 대화 시작'}
          </div>

        </div>
      </div>
    </div>
  );
}
