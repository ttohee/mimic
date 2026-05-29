import { Icon, LogoMark, PageHead, levelBadge } from '../components/Shell';
import { USER, STATS } from '../lib/data';
import type { ViewType } from '../types';

interface Props { go: (v: ViewType) => void; notif: boolean; setNotif: (v: boolean) => void; onReset: () => void; vocabCount: number; }

function StatCard({ label, value, unit, icon }: { label: string; value: number; unit: string; icon: 'chat' | 'sparkle' | 'cards' | 'fire' }) {
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

export default function MyPage({ go: _go, notif, setNotif, onReset, vocabCount: _vocabCount }: Props) {
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  return (
    <div style={{ padding: '34px 40px 60px', maxWidth: 880, margin: '0 auto' }}>
      <PageHead icon="👤" title="마이페이지" />

      {/* profile */}
      <div className="card" style={{ padding: '24px 28px', borderRadius: 'var(--r-xl)', display: 'flex', alignItems: 'center', gap: 22, marginBottom: 18, background: 'linear-gradient(120deg, var(--brand-50), var(--surface) 65%)' }}>
        <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'linear-gradient(150deg,var(--brand-300),var(--brand-600))', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: 'var(--sh-md)' }}>
          <LogoMark size={46} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800 }}>{USER.name}</h2>
            {levelBadge(USER.level)}
          </div>
          <div style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 4 }}>{USER.email}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <span className="badge badge-streak"><Icon name="fire" size={13} /> {USER.streak}일 연속</span>
            <span className="badge" style={{ background: 'var(--brand-50)', color: 'var(--brand-strong)' }}>가입 {USER.joined}</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm"><Icon name="edit" size={16} /> 수정</button>
      </div>

      {/* stats */}
      <h3 style={{ fontSize: 16, fontWeight: 800, margin: '4px 0 12px', display: 'flex', alignItems: 'center', gap: 7 }}>📈 누적 학습 통계</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="총 연습 횟수"   value={STATS.totalSessions} unit="회" icon="chat" />
        <StatCard label="평균 발음 점수" value={STATS.avgScore}      unit="점" icon="sparkle" />
        <StatCard label="학습한 단어"    value={STATS.wordsLearned}  unit="개" icon="cards" />
        <StatCard label="최장 연속 학습" value={STATS.longestStreak} unit="일" icon="fire" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* this week */}
        <div className="card" style={{ padding: '20px 24px', borderRadius: 'var(--r-lg)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 16px' }}>📅 이번 주 학습 현황</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {days.map((d, i) => {
              const done = STATS.week[i];
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
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>이번 주 {STATS.week.filter(Boolean).length}일 학습 완료 🎯</div>
        </div>

        {/* settings */}
        <div className="card" style={{ padding: '20px 24px', borderRadius: 'var(--r-lg)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 14px' }}>⚙️ 설정</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="mic" size={17} style={{ color: 'var(--brand-strong)' }} /> 마이크 권한</div>
            <span className="badge badge-beg"><Icon name="check" size={12} /> 허용됨</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="bell" size={17} style={{ color: 'var(--brand-strong)' }} /> 학습 알림</div>
            <button onClick={() => setNotif(!notif)} style={{ width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', background: notif ? 'var(--brand-500)' : '#CBD3C8', position: 'relative', transition: 'background .2s' }}>
              <span style={{ position: 'absolute', top: 3, left: notif ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
            </button>
          </div>
          <button className="btn btn-danger btn-sm btn-block" style={{ marginTop: 14 }} onClick={onReset}>데이터 초기화</button>
        </div>
      </div>
    </div>
  );
}
