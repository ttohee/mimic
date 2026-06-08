import { Wordmark, Parrot, Icon, ScoreRing } from '../components/Shell';
import type { ViewType } from '../types';

interface Props { go: (v: ViewType) => void; onStart: (tab: 'login' | 'signup') => void; }

export default function Landing({ go: _go, onStart }: Props) {
  const features = [
    { icon: '🗣️', t: '실전 시나리오 학습',  d: '공항·병원·면접 등 9가지 실제 상황을 AI 파트너와 롤플레이하며 연습해요.' },
    { icon: '🎯', t: 'AI 발음 분석',         d: '정확도·억양·속도를 항목별로 채점하고, 원어민 발음과 비교해 알려줘요.' },
    { icon: '📚', t: '자동 단어장',           d: '발음이 약했던 단어는 자동으로 단어장에 쌓이고, 마스터하면 사라져요.' },
    { icon: '📝', t: '대본 다운로드',         d: '지난 대화를 언제든 다시 보고 .txt로 저장해 복습할 수 있어요.' },
    { icon: '🏆', t: '랭킹 & 음성 피드',     d: '발음 점수 랭킹과 다른 학습자들의 음성 피드로 동기부여를 받아요.' },
    { icon: '🦜', t: 'Mimic 파트너',         d: '친절한 앵무새 Mimic이 더 나은 표현을 자연스럽게 제안해줘요.' },
  ];
  const flow = [
    { n: '01', t: '시나리오 선택', d: '오늘 연습할 상황을 골라요' },
    { n: '02', t: 'AI와 회화',    d: 'Mimic과 영어로 대화해요' },
    { n: '03', t: '발음 결과 확인', d: '점수와 취약 단어를 받아요' },
    { n: '04', t: '자동 복습',    d: '약한 단어를 마스터해요' },
  ];

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      {/* nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '15px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Wordmark size={25} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onStart('login')}>로그인</button>
            <button className="btn btn-primary btn-sm" onClick={() => onStart('signup')}>무료로 시작하기</button>
          </div>
        </div>
      </header>

      {/* hero */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 32px 40px', display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 48, alignItems: 'center' }}>
        <div className="fadeUp">
          <span className="badge badge-beg" style={{ fontSize: 13, padding: '7px 14px' }}>🦜 AI 파트너와 매일 10분 영어 회화</span>
          <h1 style={{ fontSize: 52, lineHeight: 1.12, margin: '20px 0 0', fontWeight: 800, letterSpacing: '-0.03em' }}>
            원어민처럼<br /><span style={{ color: 'var(--brand-strong)' }}>말하는 그날까지</span>,<br />
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--brand)' }}>Mimic</span>이 함께해요
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.6, margin: '22px 0 30px', maxWidth: 460 }}>
            실제 상황을 시뮬레이션하며 영어 회화와 발음을 동시에 연습하세요.<br />
            친절한 앵무새 Mimic이 즉각적인 발음 피드백을 드려요.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <button className="btn btn-primary btn-lg" onClick={() => onStart('signup')}>
              무료로 시작하기 <Icon name="arrow" size={20} />
            </button>
            <button className="btn" style={{ background: 'transparent', color: 'var(--text-3)', padding: '4px 8px', fontSize: 14 }}
              onClick={() => onStart('login')}>이미 계정이 있어요 →</button>
          </div>
        </div>

        {/* hero visual */}
        <div style={{ position: 'relative', display: 'grid', placeItems: 'center', minHeight: 380 }}>
          <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, var(--brand-50), transparent 68%)' }} />
          <Parrot slot="hero" w={300} h={300} float />
          <div className="card popIn" style={{ position: 'absolute', right: -8, top: 28, padding: '12px 15px', maxWidth: 220, boxShadow: 'var(--sh-lg)', borderRadius: 'var(--r-lg) var(--r-lg) var(--r-lg) 6px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-strong)', marginBottom: 3 }}>Mimic</div>
            <div style={{ fontSize: 13.5, color: 'var(--text)' }}>"Good morning! How can I help you today?"</div>
          </div>
          <div className="card popIn" style={{ position: 'absolute', left: 0, bottom: 26, padding: '12px 16px', boxShadow: 'var(--sh-lg)', display: 'flex', alignItems: 'center', gap: 12, animationDelay: '.15s' }}>
            <ScoreRing score={94} size={52} stroke={6} showLabel={false} />
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>발음 점수</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--score-hi)' }}>훌륭해요!</div>
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: 33, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>말하기가 늘 수밖에 없는 이유</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-3)', marginTop: 10, fontSize: 16 }}>연습 → 피드백 → 복습까지, Mimic 안에서 끝나요</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginTop: 38 }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding: '26px 24px', borderRadius: 'var(--r-lg)', transition: 'transform .18s, box-shadow .18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-sm)'; }}>
              <div style={{ width: 52, height: 52, borderRadius: 'var(--r-md)', background: 'var(--brand-50)', display: 'grid', placeItems: 'center', fontSize: 26 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '16px 0 7px' }}>{f.t}</h3>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* flow */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px 0' }}>
        <div className="card" style={{ padding: '44px 40px', borderRadius: 'var(--r-xl)', background: 'linear-gradient(135deg, var(--brand-50), var(--surface))' }}>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, margin: '0 0 36px', letterSpacing: '-0.02em' }}>4단계로 시작하는 영어 회화</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, position: 'relative' }}>
            {flow.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 60, height: 60, margin: '0 auto', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--brand-200)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--brand-strong)' }}>{s.n}</div>
                <h4 style={{ margin: '14px 0 4px', fontSize: 16, fontWeight: 700 }}>{s.t}</h4>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-3)' }}>{s.d}</p>
                {i < 3 && <div style={{ position: 'absolute', top: 29, right: -7, color: 'var(--brand-300)' }}><Icon name="arrow" size={18} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', borderRadius: 'var(--r-xl)', padding: '56px 40px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.1)', top: -80, right: -40 }} />
          <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.08)', bottom: -60, left: 30 }} />
          <h2 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', position: 'relative' }}>오늘부터 영어로 말해볼까요?</h2>
          <p style={{ fontSize: 16.5, opacity: .92, margin: '14px 0 28px', position: 'relative' }}>가입은 30초, 첫 회화는 지금 바로.</p>
          <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--brand-700)', position: 'relative' }} onClick={() => onStart('signup')}>
            무료로 시작하기 <Icon name="arrow" size={20} />
          </button>
        </div>
      </section>

      {/* footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Wordmark size={20} />
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>AI 영어 회화 학습 서비스</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>© 2026 Mimic</div>
        </div>
      </footer>
    </div>
  );
}
