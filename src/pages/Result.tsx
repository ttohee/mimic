import { Icon, ScoreRing, PageHead } from '../components/Shell';
import { speakEN } from '../lib/speech';
import { scoreColor } from '../lib/result';
import type { ResultData, Scenario, ViewType } from '../types';

interface Props {
  data: ResultData;
  scenario: Scenario;
  go: (v: ViewType) => void;
  onRetry: () => void;
  addedWords: string[];
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13.5 }}>
        <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontWeight: 800, color }}>{value}</span>
      </div>
      <div className="pbar"><span style={{ width: value + '%', background: color }} /></div>
    </div>
  );
}

export default function Result({ data, scenario, go, onRetry, addedWords }: Props) {
  const r = data;
  return (
    <div style={{ padding: '34px 40px 60px', maxWidth: 1000, margin: '0 auto' }}>
      <PageHead icon="📊" title="발음 분석 결과"
        sub={`${scenario.en} · ${scenario.ko} · ${new Date().toLocaleDateString('ko-KR')}`}
        right={
          <div style={{ display: 'flex', gap: 9 }}>
            <button className="btn btn-soft btn-sm" onClick={() => go('vocab')}><Icon name="cards" size={16} /> 단어장 추가됨</button>
            <button className="btn btn-primary btn-sm" onClick={onRetry}><Icon name="play" size={15} /> 다시 연습</button>
          </div>
        } />

      {/* auto-add notice */}
      {addedWords.length > 0 && (
        <div className="card fadeUp" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', marginBottom: 20, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 'var(--r-md)' }}>
          <Icon name="sparkle" size={20} style={{ color: 'var(--brand-strong)' }} />
          <span style={{ fontSize: 14, color: 'var(--brand-ink)' }}>
            발음 점수 50점 미만 단어 <b>{addedWords.length}개</b>가 자동으로 단어장에 추가됐어요 — <b>{addedWords.join(', ')}</b>
          </span>
        </div>
      )}

      {/* overall + metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18, marginBottom: 18 }}>
        <div className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-lg)' }}>
          <div style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 600, marginBottom: 14 }}>종합 발음 점수</div>
          <ScoreRing score={r.overall} size={150} />
          <div style={{ marginTop: 14, fontSize: 14.5, fontWeight: 700, color: scoreColor(r.overall) }}>
            {r.overall >= 80 ? '훌륭해요! 거의 원어민 같아요 🎉' : r.overall >= 60 ? '좋아요! 조금만 더 다듬어봐요 👍' : '괜찮아요, 반복하면 늘어요 💪'}
          </div>
        </div>
        <div className="card" style={{ padding: '26px 30px', borderRadius: 'var(--r-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 600, marginBottom: 18 }}>세부 항목</div>
          <MetricBar label="정확도 (Accuracy)"  value={r.accuracy}   color={scoreColor(r.accuracy)} />
          <MetricBar label="억양 (Intonation)"  value={r.intonation} color={scoreColor(r.intonation)} />
          <MetricBar label="속도 (Pace)"        value={r.speed}      color={scoreColor(r.speed)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* per-sentence */}
        <div className="card" style={{ padding: '22px 24px', borderRadius: 'var(--r-lg)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="chat" size={18} style={{ color: 'var(--brand-strong)' }} /> 문장별 정확도
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {r.lines.map((l, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.45 }}>{l.text}</span>
                  <span style={{ fontWeight: 800, color: scoreColor(l.score), fontSize: 14 }}>{l.score}</span>
                </div>
                <div className="pbar" style={{ height: 6 }}><span style={{ width: l.score + '%', background: scoreColor(l.score) }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* native comparison */}
        <div className="card" style={{ padding: '22px 24px', borderRadius: 'var(--r-lg)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="speaker" size={18} style={{ color: 'var(--brand-strong)' }} /> 원어민 발음 비교
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {r.weak.map((w, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => speakEN(w.word)} style={{ border: 'none', background: 'var(--brand-50)', color: 'var(--brand-strong)', width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                      <Icon name="speaker" size={15} />
                    </button>
                    <b style={{ fontSize: 15 }}>{w.word}</b>
                  </div>
                  <span className={`badge ${w.weak === '발음' ? 'badge-adv' : w.weak === '억양' ? 'badge-mid' : 'badge-beg'}`}>{w.weak}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: 'var(--lv-adv-bg)', borderRadius: 'var(--r-xs)', padding: '6px 10px' }}>
                    <div style={{ fontSize: 10.5, color: '#cf443c', fontWeight: 700 }}>내 발음</div>
                    <div style={{ fontSize: 13.5, color: '#cf443c' }}>{w.mine}</div>
                  </div>
                  <div style={{ background: 'var(--lv-beg-bg)', borderRadius: 'var(--r-xs)', padding: '6px 10px' }}>
                    <div style={{ fontSize: 10.5, color: '#138a13', fontWeight: 700 }}>원어민</div>
                    <div style={{ fontSize: 13.5, color: '#138a13' }}>{w.native}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
