import { Icon, Parrot, levelBadge } from '../components/Shell';
import { SCENARIOS, LEVELS } from '../lib/data';
import type { Level, Scenario, ViewType } from '../types';

interface Props { go: (v: ViewType) => void; onPick: (s: Scenario) => void; homeLayout?: 'level' | 'grid'; nickname: string; avgScore: number; streak: number; }

function ScenarioCard({ s, onPick }: { s: Scenario; onPick: (s: Scenario) => void }) {
  const L = LEVELS[s.level];
  return (
    <button onClick={() => onPick(s)} className="card" style={{
      textAlign: 'left', padding: '20px 20px 18px', borderRadius: 'var(--r-lg)', cursor: 'pointer',
      position: 'relative', overflow: 'hidden', transition: 'transform .16s, box-shadow .16s',
      borderTop: `3px solid ${L.color}`,
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-sm)'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 46, height: 46, borderRadius: 'var(--r-md)', display: 'grid', placeItems: 'center', fontSize: 24, background: `var(--lv-${L.cls}-bg)` }}>{s.icon}</div>
        {levelBadge(s.level)}
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '14px 0 5px', color: 'var(--text)' }}>{s.en}</h3>
      <div style={{ fontSize: 13, fontWeight: 700, color: L.color, marginBottom: 6 }}>{s.ko}</div>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, color: 'var(--brand-strong)', fontWeight: 700, fontSize: 13.5 }}>
        <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-500)', color: '#fff', display: 'grid', placeItems: 'center' }}>
          <Icon name="play" size={14} />
        </span>
        대화 시작
      </div>
    </button>
  );
}

export default function Home({ go, onPick, homeLayout = 'level', nickname, avgScore, streak }: Props) {
  const grouped = homeLayout === 'level';
  const byLevel: Record<Level, Scenario[]> = { beg: [], mid: [], adv: [] };
  SCENARIOS.forEach(s => byLevel[s.level].push(s));

  return (
    <div style={{ padding: '34px 40px 60px', maxWidth: 1080, margin: '0 auto' }}>
      {/* greeting hero */}
      <div className="card fadeUp" style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '26px 30px', borderRadius: 'var(--r-xl)', background: 'linear-gradient(120deg, var(--brand-50), var(--surface) 70%)', marginBottom: 30 }}>
        <Parrot slot="home" w={104} h={104} float />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 27, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            오늘도 연습하러 왔군요, <span style={{ color: 'var(--brand-strong)' }}>{nickname}</span>님!
          </h1>
          <p style={{ color: 'var(--text-2)', margin: '7px 0 0', fontSize: 15 }}>어떤 상황에서 Mimic과 대화해볼까요? 한 마디씩 쌓다 보면 실력이 늘어요.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {streak > 0 && <span className="badge badge-streak"><Icon name="fire" size={13} /> {streak}일 연속 학습 중</span>}
            {avgScore > 0
              ? <span className="badge" style={{ background: 'var(--brand-50)', color: 'var(--brand-strong)' }}>평균 발음 {avgScore}점</span>
              : <span className="badge" style={{ background: 'var(--brand-50)', color: 'var(--brand-strong)' }}>오늘 첫 연습 도전해봐요! 🦜</span>
            }
          </div>
        </div>
      </div>

      {grouped
        ? (['beg', 'mid', 'adv'] as Level[]).map(lv => (
          <div key={lv} style={{ marginBottom: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: LEVELS[lv].color }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{LEVELS[lv].ko}</h2>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{byLevel[lv].length}개 시나리오</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {byLevel[lv].map(s => <ScenarioCard key={s.id} s={s} onPick={onPick} />)}
            </div>
          </div>
        ))
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 30 }}>
            {SCENARIOS.map(s => <ScenarioCard key={s.id} s={s} onPick={onPick} />)}
          </div>
        )
      }

      {/* shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { icon: 'cards' as const, t: '단어 플래시카드', d: '약했던 단어를 빠르게 복습해요', go: 'vocab' as ViewType },
          { icon: 'trophy' as const, t: '랭킹 보기', d: '내 발음 순위를 확인해요', go: 'ranking' as ViewType },
        ].map((q, i) => (
          <button key={i} className="card" onClick={() => go(q.go)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', borderRadius: 'var(--r-lg)', cursor: 'pointer', textAlign: 'left', transition: 'transform .16s, box-shadow .16s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-sm)'; }}>
            <span style={{ width: 46, height: 46, borderRadius: 'var(--r-md)', background: 'var(--brand-50)', color: 'var(--brand-strong)', display: 'grid', placeItems: 'center' }}>
              <Icon name={q.icon} size={22} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>{q.t}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{q.d}</div>
            </div>
            <Icon name="arrow" size={18} style={{ color: 'var(--text-3)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
