import { useState } from 'react';
import { Icon, PageHead } from '../components/Shell';
import { SCENARIOS } from '../lib/data';
import type { TranscriptEntry, ViewType } from '../types';

interface Props { go: (v: ViewType) => void; transcripts: TranscriptEntry[]; onDelete: (id: string) => void; }

function tColor(s: number) { return s >= 80 ? 'var(--score-hi)' : s >= 60 ? 'var(--score-mid)' : 'var(--score-lo)'; }
function scenInfo(id: string) { return SCENARIOS.find(x => x.id === id) ?? { en: id, ko: '', icon: '💬', level: 'beg' as const }; }

function download(t: TranscriptEntry) {
  const sc = scenInfo(t.scenario);
  const body =
    `Mimic — 회화 대본\n시나리오: ${sc.en} (${sc.ko})\n날짜: ${t.date}\n발음 점수: ${t.score}/100\n${'='.repeat(36)}\n\n` +
    t.lines.map(([who, line]) => `${who === 'Mimic' ? 'Mimic' : 'Me  '} : ${line}`).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
  a.download = `mimic_${t.scenario}_${t.date}.txt`;
  a.click();
}

export default function Transcript({ go: _go, transcripts, onDelete }: Props) {
  const [scen, setScen] = useState('all');
  const [sort, setSort] = useState<'recent' | 'score'>('recent');

  let list = transcripts.filter(t => scen === 'all' || t.scenario === scen);
  list = [...list].sort((a, b) =>
    sort === 'recent' ? b.date.localeCompare(a.date) : b.score - a.score,
  );

  return (
    <div style={{ padding: '34px 40px 60px', maxWidth: 880, margin: '0 auto' }}>
      <PageHead icon="📝" title="대본 다운로드" sub="지난 회화를 다시 보고 .txt로 저장해 복습하세요" />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={scen} onChange={e => setScen(e.target.value)}
          style={{ border: '1.5px solid var(--border-strong)', background: 'var(--surface)', borderRadius: 'var(--r-pill)', padding: '9px 40px 9px 16px', fontSize: 14, color: 'var(--text)', cursor: 'pointer' }}>
          <option value="all">전체 시나리오</option>
          {SCENARIOS.map(s => <option key={s.id} value={s.id}>{s.en} · {s.ko}</option>)}
        </select>
        <div className="segment">
          {([['recent', '최근순'], ['score', '점수순']] as const).map(([k, l]) => (
            <button key={k} className={sort === k ? 'on' : ''} onClick={() => setSort(k)}>{l}</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: 'var(--r-lg)' }}>
          <div style={{ fontSize: 40 }}>📝</div>
          <h3 style={{ margin: '12px 0 4px' }}>아직 대본이 없어요</h3>
          <p style={{ color: 'var(--text-3)', margin: 0 }}>회화를 완료하면 여기에 대본이 자동으로 저장돼요.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((t, i) => {
            const sc = scenInfo(t.scenario);
            return (
              <div key={t.id} className="card" style={{ padding: '18px 22px', borderRadius: 'var(--r-lg)', animation: `fadeUp .4s ${i * 0.04}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 'var(--r-md)', background: `var(--lv-${sc.level}-bg)`, display: 'grid', placeItems: 'center', fontSize: 23 }}>{sc.icon}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{sc.en} <span style={{ color: 'var(--text-3)', fontWeight: 600, fontSize: 13.5 }}>· {sc.ko}</span></div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{t.date}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>발음</div>
                      <div style={{ fontWeight: 800, fontSize: 19, color: tColor(t.score) }}>{t.score}</div>
                    </div>
                    <button className="btn btn-soft btn-sm" onClick={() => download(t)}>
                      <Icon name="download" size={16} /> .txt
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => { if (confirm('이 대본을 삭제할까요?')) onDelete(t.id); }}
                      style={{ padding: '6px 10px' }}
                      title="삭제"
                    >
                      <Icon name="x" size={15} />
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {t.lines.slice(0, 2).map(([who, line], j) => (
                    <div key={j} style={{ fontSize: 13.5, color: 'var(--text-2)' }}>
                      <b style={{ color: who === 'Mimic' ? 'var(--brand-strong)' : 'var(--text)' }}>{who === 'Mimic' ? 'Mimic' : 'Me'}</b>
                      <span style={{ color: 'var(--text-3)' }}> : {line}</span>
                    </div>
                  ))}
                  {t.lines.length > 2 && (
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>+{t.lines.length - 2}개 더…</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
