import { Icon, ProfileAvatar, PageHead, levelBadge } from '../components/Shell';
import { scoreColor } from '../lib/result';
import type { TranscriptEntry, ViewType, VocabWord } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
  go: (v: ViewType) => void;
  onReset: () => void;
  vocabCount: number;
  transcripts: TranscriptEntry[];
  words: VocabWord[];
}

function StatCard({ label, value, unit, icon }: { label: string; value: number | string; unit: string; icon: 'chat' | 'sparkle' | 'cards' | 'fire' }) {
  return (
    <div className="card" style={{ padding: '18px 20px', borderRadius: 'var(--r-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 13, fontWeight: 600 }}>
        <Icon name={icon} size={16} style={{ color: 'var(--brand-strong)' }} /> {label}
      </div>
      <div style={{ marginTop: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--text)' }}>
        {value}<span style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 600, marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  );
}

/* ── Score trend bar chart ─────────────────────────────────── */
function ScoreTrendChart({ transcripts }: { transcripts: TranscriptEntry[] }) {
  const recent = [...transcripts].slice(0, 10).reverse(); // oldest first
  if (recent.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-3)', fontSize: 13.5 }}>
        2회 이상 연습하면 점수 변화를 확인할 수 있어요 📈
      </div>
    );
  }
  const svgH = 80;
  const w = 100 / recent.length;
  return (
    <svg viewBox={`0 0 100 ${svgH + 18}`} style={{ width: '100%', height: 120, display: 'block' }}>
      {/* baseline */}
      <line x1="0" y1={svgH} x2="100" y2={svgH} stroke="var(--border)" strokeWidth="0.5" />
      {recent.map((t, i) => {
        const barH = Math.max(4, (t.score / 100) * svgH);
        const x = i * w + w * 0.15;
        const bw = w * 0.70;
        const y = svgH - barH;
        const col = t.score >= 80 ? 'var(--score-hi)' : t.score >= 60 ? 'var(--score-mid)' : 'var(--score-lo)';
        return (
          <g key={t.id}>
            <rect x={x} y={y} width={bw} height={barH} rx={1.5} fill={col} opacity={0.82} />
            <text x={x + bw / 2} y={y - 2} textAnchor="middle" fontSize="5" fill="var(--text-2)">{t.score}</text>
            <text x={x + bw / 2} y={svgH + 10} textAnchor="middle" fontSize="4" fill="var(--text-3)">{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Week activity ─────────────────────────────────────────── */
function computeWeek(transcripts: TranscriptEntry[]): boolean[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const mondayOffset = dow === 0 ? 6 : dow - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const week = Array(7).fill(false);
  transcripts.forEach(t => {
    const d = new Date(t.date);
    const diff = Math.round((d.getTime() - monday.getTime()) / 86_400_000);
    if (diff >= 0 && diff < 7) week[diff] = true;
  });
  return week;
}

/* ── Main ──────────────────────────────────────────────────── */
export default function MyPage({ go: _go, onReset, transcripts, words }: Props) {
  const { user } = useAuth();
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  // Compute real stats from live data
  const totalSessions = transcripts.length;
  const avgScore = totalSessions
    ? Math.round(transcripts.reduce((s, t) => s + t.score, 0) / totalSessions)
    : 0;
  const wordsLearned = words.length;
  const streak = computeWeek(transcripts).filter(Boolean).length;
  const week = computeWeek(transcripts);

  // Nickname from Supabase user metadata or email prefix
  const nickname = (user?.user_metadata?.nickname as string) || user?.email?.split('@')[0] || 'Mimic 유저';
  const email = user?.email ?? '';
  const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '';

  return (
    <div style={{ padding: '34px 40px 60px', maxWidth: 880, margin: '0 auto' }}>
      <PageHead icon="👤" title="마이페이지" />

      {/* profile */}
      <div className="card" style={{ padding: '24px 28px', borderRadius: 'var(--r-xl)', display: 'flex', alignItems: 'center', gap: 22, marginBottom: 18, background: 'linear-gradient(120deg, var(--brand-50), var(--surface) 65%)' }}>
        <ProfileAvatar size={84} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800 }}>{nickname}</h2>
            {levelBadge(avgScore >= 80 ? 'adv' : avgScore >= 60 ? 'mid' : 'beg')}
          </div>
          <div style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 4 }}>{email}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <span className="badge badge-streak"><Icon name="fire" size={13} /> {streak}일 연속</span>
            {joined && <span className="badge" style={{ background: 'var(--brand-50)', color: 'var(--brand-strong)' }}>가입 {joined}</span>}
          </div>
        </div>
      </div>

      {/* stats */}
      <h3 style={{ fontSize: 16, fontWeight: 800, margin: '4px 0 12px', display: 'flex', alignItems: 'center', gap: 7 }}>📈 누적 학습 통계</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="총 연습 횟수"   value={totalSessions} unit="회" icon="chat" />
        <StatCard label="평균 발음 점수" value={avgScore || '—'} unit="점" icon="sparkle" />
        <StatCard label="단어장 단어"    value={wordsLearned}  unit="개" icon="cards" />
        <StatCard label="이번 주 학습"   value={streak}        unit="일" icon="fire" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* score trend */}
        <div className="card" style={{ padding: '20px 24px', borderRadius: 'var(--r-lg)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 12px' }}>
            📊 발음 점수 추이 <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>(최근 {Math.min(transcripts.length, 10)}회)</span>
          </h3>
          <ScoreTrendChart transcripts={transcripts} />
          {transcripts.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 10, justifyContent: 'center' }}>
              {[['var(--score-hi)', '80+ 우수'], ['var(--score-mid)', '60–79 양호'], ['var(--score-lo)', '~59 노력']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />
                  {l}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* this week */}
        <div className="card" style={{ padding: '20px 24px', borderRadius: 'var(--r-lg)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 16px' }}>📅 이번 주 학습 현황</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {days.map((d, i) => {
              const done = week[i];
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto', background: done ? 'var(--brand-500)' : 'var(--bg)', color: done ? '#fff' : 'var(--text-3)', border: done ? 'none' : '1.5px dashed var(--border-strong)' }}>
                    {done ? <Icon name="check" size={18} /> : ''}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 6, fontWeight: 600 }}>{d}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>
            이번 주 {week.filter(Boolean).length}일 학습 완료 🎯
          </div>

          {/* score history compact */}
          {transcripts.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 8, fontWeight: 600 }}>최근 회화</div>
              {transcripts.slice(0, 3).map(t => {
                const sc = t.score;
                return (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-2)' }}>{t.date} · {t.scenario}</span>
                    <span style={{ fontWeight: 700, color: scoreColor(sc) }}>{sc}점</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* settings */}
      <div className="card" style={{ padding: '20px 24px', borderRadius: 'var(--r-lg)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 14px' }}>⚙️ 설정</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="mic" size={17} style={{ color: 'var(--brand-strong)' }} /> 마이크 권한</div>
          <span className="badge badge-beg"><Icon name="check" size={12} /> 허용됨</span>
        </div>
        <button className="btn btn-danger btn-sm" style={{ marginTop: 10 }} onClick={onReset}>데이터 초기화</button>
      </div>
    </div>
  );
}
