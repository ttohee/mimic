import { useState, useEffect } from 'react';
import { Icon, ProfileAvatar, PageHead } from '../components/Shell';
import { SCENARIOS } from '../lib/data';
import { loadLeaderboard, loadFeed, type LeaderboardEntry, type FeedEntry } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { speakEN } from '../lib/speech';

function medalColor(r: number) { return r === 1 ? '#F5C518' : r === 2 ? '#A9B4BC' : r === 3 ? '#CD8E4E' : null; }
function scenKo(id: string) { return SCENARIOS.find(s => s.id === id)?.ko ?? id; }
function scenIcon(id: string) { return SCENARIOS.find(s => s.id === id)?.icon ?? '💬'; }

type RankedEntry = LeaderboardEntry & { rank: number; you: boolean };

export default function Ranking() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'rank' | 'feed'>('rank');
  const [board, setBoard] = useState<RankedEntry[]>([]);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [lb, fd] = await Promise.all([loadLeaderboard(), loadFeed()]);
      setBoard(lb.map((e, i) => ({ ...e, rank: i + 1, you: e.user_id === user?.id })));
      setFeed(fd);
      setLoading(false);
    }
    load();
  }, [user?.id]);

  const top3 = board.length >= 3 ? [board[1], board[0], board[2]] : [];

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)', fontSize: 14 }}>불러오는 중…</div>
      ) : tab === 'rank' ? (
        board.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: 'var(--r-lg)' }}>
            <div style={{ fontSize: 40 }}>🏆</div>
            <h3 style={{ margin: '12px 0 4px' }}>아직 순위가 없어요</h3>
            <p style={{ color: 'var(--text-3)', margin: 0 }}>회화를 완료하면 자동으로 랭킹에 등록돼요.</p>
          </div>
        ) : (
          <>
            {top3.length === 3 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, alignItems: 'end', marginBottom: 20 }}>
                {top3.map((u, idx) => {
                  if (!u) return <div key={idx} />;
                  const tall = u.rank === 1;
                  return (
                    <div key={u.user_id} className="card" style={{ padding: '18px 10px 16px', borderRadius: 'var(--r-lg)', textAlign: 'center', marginTop: tall ? 0 : 16, border: tall ? '2px solid #F5C518' : '1px solid var(--border)' }}>
                      <div style={{ fontSize: 22 }}>{u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : '🥉'}</div>
                      <div style={{ margin: '8px auto', width: 52, height: 52 }}><ProfileAvatar size={52} /></div>
                      <div style={{ fontWeight: 800, fontSize: 14.5 }}>{u.nickname}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--brand-strong)' }}>{u.avg_score}<span style={{ fontSize: 12, color: 'var(--text-3)' }}>점</span></div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="card" style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              {board.map((u, i) => (
                <div key={u.user_id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < board.length - 1 ? '1px solid var(--border)' : 'none', background: u.you ? 'var(--brand-50)' : 'transparent' }}>
                  <div style={{ width: 30, textAlign: 'center', fontWeight: 800, fontSize: 16, color: medalColor(u.rank) ?? 'var(--text-3)' }}>{u.rank}</div>
                  <ProfileAvatar size={40} />
                  <div style={{ flex: 1, fontWeight: u.you ? 800 : 600, fontSize: 15 }}>
                    {u.nickname} {u.you && <span className="badge badge-beg" style={{ marginLeft: 6 }}>나</span>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.total_sessions}회 연습</div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--brand-strong)' }}>{u.avg_score}<span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>점</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        feed.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: 'var(--r-lg)' }}>
            <div style={{ fontSize: 40 }}>🎤</div>
            <h3 style={{ margin: '12px 0 4px' }}>아직 음성 피드가 없어요</h3>
            <p style={{ color: 'var(--text-3)', margin: 0 }}>발음 점수 70점 이상이면 자동으로 피드에 등록돼요.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {feed.map((v, i) => {
              const isPlaying = playing === i;
              return (
                <div key={i} className="card" style={{ padding: '16px 20px', borderRadius: 'var(--r-lg)', animation: `fadeUp .4s ${i * 0.04}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
                    <ProfileAvatar size={38} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{v.nickname}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{scenKo(v.best_scenario)}</div>
                    </div>
                    <span className="badge" style={{ background: 'var(--brand-50)', color: 'var(--brand-strong)' }}>{scenIcon(v.best_scenario)} {v.best_scenario}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
                    <button
                      onClick={() => { setPlaying(isPlaying ? null : i); if (!isPlaying) speakEN(v.best_line); }}
                      style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'var(--brand-500)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <Icon name={isPlaying ? 'x' : 'play'} size={17} />
                    </button>
                    <div style={{ fontSize: 13.5, color: 'var(--text-2)', fontStyle: 'italic', flex: 1 }}>"{v.best_line}"</div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
