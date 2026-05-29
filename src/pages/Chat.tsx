import { useState, useEffect, useRef } from 'react';
import { Icon, LogoMark, levelBadge } from '../components/Shell';
import { speakEN } from '../lib/speech';
import { claudeComplete } from '../lib/ai';
import type { Message, Scenario, ViewType } from '../types';

interface Props { scenario: Scenario; go: (v: ViewType) => void; onEnd: (msgs: Message[], s: Scenario) => void; }

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
  const didSpeak = useRef(false);
  useEffect(() => {
    if (!mine && autoSpeak && !didSpeak.current) { didSpeak.current = true; speakEN(m.text); }
  }, []);
  const tipMatch = !mine ? m.text.match(/\(([^)]*tip[^)]*)\)/i) : null;
  const main = tipMatch ? m.text.replace(tipMatch[0], '').trim() : m.text;
  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', gap: 10, animation: 'fadeUp .35s ease' }}>
      {!mine && (
        <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(150deg,var(--brand-300),var(--brand-600))', display: 'grid', placeItems: 'center', alignSelf: 'flex-end' }}>
          <LogoMark size={22} />
        </div>
      )}
      <div style={{ maxWidth: '64%' }}>
        <div style={{ padding: '13px 17px', fontSize: 15.5, lineHeight: 1.55, background: mine ? 'var(--brand-500)' : 'var(--surface)', color: mine ? '#fff' : 'var(--text)', border: mine ? 'none' : '1px solid var(--border)', borderRadius: mine ? 'var(--r-lg) var(--r-lg) 6px var(--r-lg)' : 'var(--r-lg) var(--r-lg) var(--r-lg) 6px', boxShadow: 'var(--sh-sm)' }}>
          {main}
          {!mine && (
            <button onClick={() => speakEN(main)} style={{ border: 'none', background: 'transparent', color: 'var(--brand-strong)', cursor: 'pointer', marginLeft: 6, verticalAlign: 'middle', padding: 2 }}>
              <Icon name="speaker" size={16} />
            </button>
          )}
        </div>
        {tipMatch && (
          <div style={{ marginTop: 6, padding: '8px 12px', background: 'var(--brand-50)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--brand-ink)', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <Icon name="sparkle" size={15} style={{ color: 'var(--brand-strong)', flexShrink: 0, marginTop: 1 }} />
            <span><b>Tip </b>{tipMatch[1].replace(/tip:?/i, '').trim()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Chat({ scenario, go, onEnd }: Props) {
  const s = scenario;
  const [msgs, setMsgs] = useState<Message[]>([{ role: 'assistant', text: s.opener }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [toast, setToast] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, thinking]);

  useEffect(() => {
    if (autoSpeak) { const t = setTimeout(() => speakEN(s.opener), 400); return () => clearTimeout(t); }
  }, []);

  async function send(text?: string) {
    const t = (text != null ? text : input).trim();
    if (!t || thinking) return;
    setInput('');
    const next: Message[] = [...msgs, { role: 'user', text: t }];
    setMsgs(next);
    setThinking(true);
    try {
      const system = `You are "Mimic", a warm, friendly parrot character who is an English conversation tutor. You are role-playing as a ${s.role} in a "${s.en}" scenario (${s.desc}). The learner is a Korean adult practicing spoken English.
Rules:
- Reply ONLY in natural spoken English, 1-3 short sentences. Stay fully in character as the ${s.role}.
- Keep the roleplay moving with a natural follow-up question.
- About every other turn, gently add ONE short suggestion for a more natural phrasing, formatted exactly like: (Tip: ...). Do not overuse it.
- Be encouraging and never break character to speak Korean.`;
      const history = next.map(m => ({ role: m.role, content: m.text }));
      const reply = await claudeComplete(history, system);
      setMsgs(m => [...m, { role: 'assistant', text: reply.trim() || "Sorry, could you say that again?" }]);
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: "Hmm, I didn't catch that — could you try again?" }]);
    } finally {
      setThinking(false);
    }
  }

  function toggleMic() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: (new () => any) | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setToast('이 브라우저는 음성 인식을 지원하지 않아요.'); setTimeout(() => setToast(''), 2600); return; }
    if (listening) { recRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = false;
    let finalText = '';
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript; else interim += r[0].transcript;
      }
      setInput(finalText || interim);
    };
    rec.onend = () => { setListening(false); if (finalText.trim()) send(finalText); };
    rec.onerror = () => setListening(false);
    recRef.current = rec; setListening(true); rec.start();
  }

  function saveTranscript() { setToast('대본이 저장되었어요 ✓'); setTimeout(() => setToast(''), 2200); }

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
        <div style={{ display: 'flex', gap: 9 }}>
          <button className="btn btn-ghost btn-sm" onClick={saveTranscript}><Icon name="save" size={16} /> 대본 저장</button>
          <button className="btn btn-danger btn-sm" onClick={() => onEnd(msgs, s)}><Icon name="x" size={16} /> 대화 종료</button>
        </div>
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

      {/* input */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '16px 28px 20px', flexShrink: 0 }}>
        {toast && <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginBottom: 10 }}>{toast}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, maxWidth: 760, margin: '0 auto' }}>
          <div className="field" style={{ flex: 1, borderRadius: 'var(--r-pill)' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }}
              placeholder={listening ? '듣고 있어요…' : '영어로 입력하거나 마이크를 눌러 말해보세요'} />
            {input && <button onClick={() => send()} style={{ border: 'none', background: 'var(--brand-500)', color: '#fff', width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon name="send" size={17} /></button>}
          </div>
          <button onClick={toggleMic} style={{ width: 64, height: 64, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0, background: listening ? 'var(--lv-adv)' : 'var(--brand-500)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'var(--sh-brand)', animation: listening ? 'pulseRing 1.4s infinite' : 'none', transition: 'background .2s' }}>
            <Icon name="mic" size={28} />
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 9 }}>
          {listening ? '다시 누르면 멈춰요' : '🎤 마이크로 말하면 자동으로 인식돼요 · 또는 직접 입력'}
        </div>
      </div>
    </div>
  );
}
