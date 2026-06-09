import { useState, useEffect, useRef } from 'react';
import { Icon, LogoMark, levelBadge } from '../components/Shell';
import { speakEN } from '../lib/speech';
import { claudeComplete } from '../lib/ai';
import type { Message, Scenario, ViewType } from '../types';

interface Props { scenario: Scenario; go: (v: ViewType) => void; onEnd: (msgs: Message[], s: Scenario) => void; }

// 태그 제거 후 순수 영어 텍스트 추출
function cleanAiText(text: string) {
  return text
    .replace(/\(Tip:[^)]+\)/gi, '')
    .replace(/\[KO:[^\]]+\]/gi, '')
    .replace(/\[OPT:[^\]]+\]/gi, '')
    .trim();
}

// STT 결과 vs 타겟 단어 일치율 계산
function scoreText(target: string, spoken: string) {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9'\s]/g, '').trim();
  const tw = clean(target).split(/\s+/).filter(Boolean);
  const sw = clean(spoken).split(/\s+/).filter(Boolean);
  const words = tw.map((word, i) => ({ word, correct: sw[i] === word }));
  const score = tw.length ? Math.round(words.filter(w => w.correct).length / tw.length * 100) : 0;
  return { score, words };
}

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

  // 모든 태그를 먼저 파싱 (useEffect보다 앞에 위치해야 클로저에서 참조 가능)
  const tipMatch = !mine ? m.text.match(/\(Tip:\s*([^)]+)\)/i) : null;
  const koMatch  = !mine ? m.text.match(/\[KO:\s*([^\]]+)\]/i)  : null;
  const optMatch = !mine ? m.text.match(/\[OPT:\s*([^\]]+)\]/i) : null;
  const opts = optMatch ? optMatch[1].split('|').map(o => o.trim()).filter(Boolean) : [];

  let main = m.text;
  if (tipMatch) main = main.replace(tipMatch[0], '');
  if (koMatch)  main = main.replace(koMatch[0], '');
  if (optMatch) main = main.replace(optMatch[0], '');
  main = main.trim();

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

        {/* 한국어 번역 (초급) */}
        {koMatch && (
          <div style={{ marginTop: 5, padding: '6px 13px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic' }}>
            🇰🇷 {koMatch[1].trim()}
          </div>
        )}

        {/* 표현 팁 */}
        {tipMatch && (
          <div style={{ marginTop: 6, padding: '8px 12px', background: 'var(--brand-50)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--brand-ink)', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <Icon name="sparkle" size={15} style={{ color: 'var(--brand-strong)', flexShrink: 0, marginTop: 1 }} />
            <span><b>💡 표현 팁 </b>{tipMatch[1].trim()}</span>
          </div>
        )}

        {/* 대답 힌트 (초급) — 읽기 전용 참고 텍스트 */}
        {opts.length > 0 && (
          <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 700, marginBottom: 6, letterSpacing: '0.03em' }}>
              이렇게 말해볼 수 있어요
            </div>
            {opts.map((opt, i) => {
              const match = opt.match(/^(.+?)\s*\(([^)]+)\)$/);
              const en = match ? match[1].trim() : opt;
              const ko = match ? match[2].trim() : '';
              return (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 600 }}>· {en}</div>
                  {ko && <div style={{ fontSize: 12, color: 'var(--text-3)', paddingLeft: 10, marginTop: 1 }}>{ko}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Chat({ scenario, go, onEnd }: Props) {
  const s = scenario;
  const [msgs, setMsgs] = useState<Message[]>([{ role: 'assistant', text: s.opener }]);
  const [thinking, setThinking]   = useState(false);
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [toast, setToast]         = useState('');
  const [shadowResult, setShadowResult] = useState<{ score: number; words: { word: string; correct: boolean }[] } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, thinking]);

  useEffect(() => {
    if (autoSpeak) { const t = setTimeout(() => speakEN(s.opener), 400); return () => clearTimeout(t); }
  }, []);

  // 초급 모드: 오프너에도 KO 번역 + OPT 힌트 붙이기
  useEffect(() => {
    if (s.level !== 'beg') return;
    const system = `Translate the given English sentence to Korean and provide 3 short example responses the learner could say.
Output ONLY these two tags, nothing else:
[KO: Korean translation here]
[OPT: English A (Korean A) | English B (Korean B) | English C (Korean C)]`;
    claudeComplete([{ role: 'user', content: `English: "${s.opener}"` }], system)
      .then(reply => {
        setMsgs([{ role: 'assistant', text: s.opener + ' ' + reply.trim() }]);
      })
      .catch(() => {});
  }, []);

  // 페이지 벗어날 때 TTS + 마이크 즉시 중단
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      recRef.current?.stop();
    };
  }, []);

  async function send(text: string, confidence?: number) {
    const t = text.trim();
    if (!t || thinking) return;
    const next: Message[] = [...msgs, { role: 'user', text: t, confidence }];
    setMsgs(next);
    setThinking(true);
    try {
      const system = `You are "Mimic", a warm, friendly parrot character who is an English conversation tutor. You are role-playing as a ${s.role} in a "${s.en}" scenario (${s.desc}). The learner is a Korean student practicing spoken English through shadowing.
Rules:
- Reply ONLY in natural spoken English. Stay fully in character as the ${s.role}.
- IMPORTANT: Keep your reply to 1-2 SHORT sentences (max 20 words total). The learner will shadow (read aloud) your sentence, so make it clear and pronounceable.
- End with a natural follow-up question or prompt to keep the roleplay going.
- About every other turn, gently add ONE short tip in Korean for a more natural phrasing. Format it EXACTLY like this at the end of your reply: (Tip: [한국어로 팁 내용]). Do not overuse it.
- Be encouraging and never break character to speak Korean (except inside the Tip and KO tags).${s.level === 'beg' ? `
- BEGINNER mode: After your English reply (and optional Tip), add these two lines:
  [KO: Korean translation of your reply in natural Korean]
  [OPT: English A (Korean A) | English B (Korean B) | English C (Korean C)]
- Keep each OPT English option short (under 10 words), realistic, and varied (e.g. yes/no/question). Add a natural Korean translation in parentheses right after each option.` : ''}`;
      const history = next.map(m => ({ role: m.role, content: m.text }));
      const reply = await claudeComplete(history, system);
      setMsgs(m => [...m, { role: 'assistant', text: reply.trim() || "Sorry, could you say that again?" }]);
      setShadowResult(null); // 새 AI 메시지 오면 이전 결과 초기화
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
    let finalConfidence = 0;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalText += r[0].transcript;
          finalConfidence = (r[0] as unknown as { confidence: number }).confidence || 0;
        } else {
          interim += r[0].transcript;
        }
      }
      // 중간 결과를 토스트로 표시
      if (interim || finalText) setToast(finalText || interim);
    };
    rec.onend = () => {
      setListening(false);
      setToast('');
      if (finalText.trim()) {
        // 마지막 AI 메시지와 발음 비교
        setMsgs(prev => {
          const lastAi = [...prev].reverse().find(m => m.role === 'assistant');
          if (lastAi) {
            const result = scoreText(cleanAiText(lastAi.text), finalText);
            setShadowResult(result);
          }
          return prev;
        });
        send(finalText, finalConfidence || undefined);
      }
    };
    rec.onerror = () => { setListening(false); setToast(''); };
    recRef.current = rec; setListening(true); rec.start();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* header */}
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

      {/* status strip */}
      <div style={{ background: 'var(--brand-50)', padding: '8px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--brand-ink)', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: thinking ? 'var(--lv-mid)' : 'var(--brand-500)', animation: 'pulseRing 1.6s infinite' }} />
          {thinking ? 'Mimic이 생각 중…' : '대화 중'}
        </div>
        <button onClick={() => setAutoSpeak(a => !a)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12.5, color: autoSpeak ? 'var(--brand-strong)' : 'var(--text-3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="speaker" size={15} /> 자동 읽기 {autoSpeak ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg)' }}>
        {msgs.map((m, i) => <Bubble key={i} m={m} autoSpeak={autoSpeak} />)}
        {thinking && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(150deg,var(--brand-300),var(--brand-600))', display: 'grid', placeItems: 'center' }}><LogoMark size={22} /></div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '12px 16px', alignSelf: 'center' }}><TypingDots /></div>
          </div>
        )}
      </div>

      {/* mic input */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '16px 28px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

          {/* 섀도잉 타겟 + 결과 */}
          {(() => {
            const lastAi = [...msgs].reverse().find(m => m.role === 'assistant');
            const target = lastAi ? cleanAiText(lastAi.text) : '';
            if (!target) return null;
            const scoreColor = shadowResult
              ? shadowResult.score >= 80 ? '#16a34a' : shadowResult.score >= 60 ? '#d97706' : '#dc2626'
              : undefined;
            return (
              <div style={{ width: '100%', maxWidth: 520, background: 'var(--brand-50)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--brand-strong)', fontWeight: 700, marginBottom: 6, letterSpacing: '0.05em' }}>
                  따라 읽어보세요
                </div>
                {shadowResult ? (
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
                  <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6, fontWeight: 500 }}>
                    {target}
                  </div>
                )}
              </div>
            );
          })()}

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
            {listening ? '마이크를 눌러 발화 종료' : '마이크를 눌러 따라 읽기'}
          </div>
        </div>
      </div>
    </div>
  );
}
