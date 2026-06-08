import type { Message, ResultData, Scenario, WeakWord } from '../types';

const TRICKY: Record<string, Omit<WeakWord, 'word' | 'score'>> = {
  itinerary:    { native: '/aɪˈtɪnərəri/', mine: '/ɪtɪˈnerɪ/',     weak: '억양', ko: '여행 일정' },
  turbulence:   { native: '/ˈtɜːbjələns/',  mine: '/ˈtʌbjulens/',   weak: '발음', ko: '난기류' },
  baggage:      { native: '/ˈbæɡɪdʒ/',      mine: '/ˈbæɡeɪdʒ/',     weak: '속도', ko: '수하물, 짐' },
  reservation:  { native: '/ˌrezəˈveɪʃn/',  mine: '/rɪˈzɜːveɪʃn/', weak: '억양', ko: '예약' },
  comfortable:  { native: '/ˈkʌmftəbl/',    mine: '/kʌmˈfɔːtəbl/', weak: '발음', ko: '편안한' },
  vegetable:    { native: '/ˈvedʒtəbl/',    mine: '/vedʒəˈteɪbl/', weak: '속도', ko: '채소' },
  allergic:     { native: '/əˈlɜːdʒɪk/',    mine: '/æˈlɝdʒɪk/',    weak: '발음', ko: '알레르기가 있는' },
  prescription: { native: '/prɪˈskrɪpʃn/',  mine: '/priˈskrɪpʃən/', weak: '속도', ko: '처방전' },
  accommodate:  { native: '/əˈkɒmədeɪt/',   mine: '/əˌkɒməˈdeɪt/', weak: '발음', ko: '수용하다, 숙박시키다' },
  schedule:     { native: '/ˈʃedjuːl/',     mine: '/ˈskedʒuːl/',   weak: '발음', ko: '일정' },
  particular:   { native: '/pəˈtɪkjələ/',   mine: '/ˌpɑːtɪˈkjulɑː/', weak: '억양', ko: '특정한' },
  available:    { native: '/əˈveɪləbl/',    mine: '/æˈveɪlæbl/',   weak: '속도', ko: '이용 가능한' },
  passport:     { native: '/ˈpɑːspɔːt/',    mine: '/ˈpæspɔːrt/',   weak: '발음', ko: '여권' },
};

function seededScore(str: string, lo: number, hi: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h * 31) + str.charCodeAt(i)) >>> 0;
  return lo + (h % (hi - lo + 1));
}

export function buildResult(msgs: Message[], _scenario: Scenario): ResultData {
  const userMsgs = msgs.filter(m => m.role === 'user');
  const lines = userMsgs.map(m => {
    const score = m.confidence != null
      ? Math.round(Math.max(20, Math.min(100, m.confidence * 100)))
      : seededScore(m.text, 58, 96);
    return { text: m.text, score };
  });

  // 사용자가 실제로 말한 문장에서 TRICKY 단어만 추출 (패딩 없음)
  const seen = new Set<string>();
  const pool: string[] = [];
  lines.forEach(l =>
    l.text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).forEach(w => {
      if (TRICKY[w] && !seen.has(w)) { seen.add(w); pool.push(w); }
    })
  );

  const weak: WeakWord[] = pool.map(w => ({
    word: w,
    ...TRICKY[w],
    score: seededScore(w, 30, 58),
  }));

  const overall = lines.length
    ? Math.round(lines.reduce((a, l) => a + l.score, 0) / lines.length)
    : 0;
  return {
    overall,
    accuracy:  Math.min(99, overall + seededScore('acc' + overall, -4, 8)),
    intonation: Math.max(40, overall + seededScore('int' + overall, -12, 4)),
    speed:     Math.min(99, overall + seededScore('spd' + overall, -6, 9)),
    lines,
    weak,
  };
}

// Used in Result page for scoring incomplete submissions
export function scoreColor(s: number): string {
  return s >= 80 ? 'var(--score-hi)' : s >= 60 ? 'var(--score-mid)' : 'var(--score-lo)';
}
