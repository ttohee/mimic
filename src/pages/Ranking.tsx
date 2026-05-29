import { useState, useMemo } from 'react';
import { Icon, LogoMark, PageHead } from '../components/Shell';
import { RANKING, VOICE_FEED } from '../lib/data';
import { speakEN } from '../lib/speech';

function Waveform({ seed = 1, playing }: { seed?: number; playing: boolean }) {
  const bars = useMemo(() => Array.from({ length: 38 }, (_, i) => {
    const h = 20 + Math.abs(Math.sin(i * 0.9 + seed) * Math.cos(i * 0.4 + seed)) * 80;
    return Math.round(h);
  }), [seed]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 40, flex: 1 }}>
      {bars.map((h, i) => (
        <span key={i} style={{ flex: 1, height: h + '%', minHeight: 3, background: playing ? 'var(--brand-500)' : 'var(--brand-200)', borderRadius: 3, animation: playing ? `barGrow .6s ${i * 0.02}s ease` : 'none', transition: 'background .2s' }} />
      ))}
    </div>
  );
}

function medalColor(r: number) { return r === 1 ? '#F5C518' : r === 2 ? '#A9B4BC' : r === 3 ? '#CD8E4E' : null; }

export default function Ranking() {
  const [tab, setTab] = useState<'rank' | 'feed'>('rank');
  const [playing, setPlaying] = useState<number | null>(null);
  const [reacted, setReacted] = useState<Record<number, { clap?: boolean }>>({});

  return (
    <div style={{ padding: '34px 40px 60px', maxWidth: 820, margin: '0 auto' }}>
      <PageHead icon="🏆" title="랭킹 & 음성 피드"
        right={
          <div className="segment">
            {([['rank', '발음 랭킹'], ['feed', '음성 피드']] as const).map(([k, l]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
        } />

      {tab === 'rank' ? (
        <>
          {/* podium */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, alignItems: 'end', marginBottom: 20 }}>
            {[RANKING[1], RANKING[0], RANKING[2]].map((u, idx) => {
              if (!u) return null;
              const tall = u.rank === 1;
              return (
                <div key={u.name + idx} className="card" style={{ padding: '18px 10px 16px', borderRadius: 'var(--r-lg)', textAlign: 'center', marginTop: tall ? 0 : 16, border: tall ? '2px solid #F5C518' : '1px solid var(--border)' }}>
                  <div style={{ fontSize: 22 }}>{u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : '🥉'}</div>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', margin: '8px auto', background: 'linear-gradient(150deg,var(--brand-300),var(--brand-600))', display: 'grid', placeItems: 'center' }}><LogoMark size={28} /></div>
                  <div style={{ fontWeight: 800, fontSize: 14.5 }}>{u.name}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--brand-strong)' }}>{u.score}<span style={{ fontSize: 12, color: 'var(--text-3)' }}>점</span></div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            {RANKING.map((u, i) => (
              <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < RANKING.length - 1 ? '1px solid var(--border)' : 'none', background: u.you ? 'var(--brand-50)' : 'transparent' }}>
                <div style={{ width: 30, textAlign: 'center', fontWeight: 800, fontSize: 16, color: medalColor(u.rank) ?? 'var(--text-3)' }}>{u.rank}</div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: u.you ? 'linear-gradient(150deg,var(--brand-300),var(--brand-600))' : '#E7ECE5', display: 'grid', placeItems: 'center' }}>
                  {u.you ? <LogoMark size={22} /> : <Icon name="user" size={20} style={{ color: 'var(--text-3)' }} />}
                </div>
                <div style={{ flex: 1, fontWeight: u.you ? 800 : 600, fontSize: 15 }}>
                  {u.name} {u.you && <span className="badge badge-beg" style={{ marginLeft: 6 }}>나</span>}
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--brand-strong)' }}>{u.score}<span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>점</span></div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {VOICE_FEED.map((v, i) => {
            const isPlaying = playing === i;
            const rc = reacted[i] ?? {};
            return (
              <div key={i} className="card" style={{ padding: '16px 20px', borderRadius: 'var(--r-lg)', animation: `fadeUp .4s ${i * 0.04}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#E7ECE5', display: 'grid', placeItems: 'center' }}><Icon name="user" size={19} style={{ color: 'var(--text-3)' }} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{v.ko} · {v.dur}초</div>
                  </div>
                  <span className="badge" style={{ background: 'var(--brand-50)', color: 'var(--brand-strong)' }}>"{v.scenario}"</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
                  <button onClick={() => { setPlaying(isPlaying ? null : i); if (!isPlaying) speakEN(v.line); }} style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'var(--brand-500)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Icon name={isPlaying ? 'x' : 'play'} size={17} />
                  </button>
                  <Waveform seed={i + 1} playing={isPlaying} />
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-2)', margin: '11px 0 12px', fontStyle: 'italic' }}>"{v.line}"</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setReacted(r => ({ ...r, [i]: { ...rc, clap: !rc.clap } }))} className="btn btn-sm" style={{ background: rc.clap ? 'var(--brand-50)' : 'var(--bg)', color: rc.clap ? 'var(--brand-strong)' : 'var(--text-2)', border: '1px solid var(--border)' }}>
                    <Icon name="clap" size={16} /> {v.claps + (rc.clap ? 1 : 0)}
                  </button>
                  <button className="btn btn-sm" style={{ background: 'var(--bg)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                    <Icon name="chat" size={16} /> {v.comments}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
