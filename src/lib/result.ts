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

const FALLBACK = ['itinerary', 'turbulence', 'baggage', 'reservation'];

function seededScore(str: string, lo: number, hi: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h * 31) + str.charCodeAt(i)) >>> 0;
  return lo + (h % (hi - lo + 1));
}

export function buildResult(msgs: Message[], _scenario: Scenario): ResultData {
  const userLines = msgs.filter(m => m.role === 'user').map(m => m.text);
  const lines = (userLines.length ? userLines : [
    "Yes, I have a flight to New York at 1 PM.",
    "Here's my passport. I have one suitcase to check.",
    "Could you tell me which gate it is?",
  ]).map(text => ({ text, score: seededScore(text, 58, 96) }));

  const found: string[] = [];
  const seen = new Set<string>();
  lines.forEach(l =>
    l.text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).forEach(w => {
      if (TRICKY[w] && !seen.has(w)) { seen.add(w); found.push(w); }
    })
  );
  let pool = [...found];
  FALLBACK.forEach(w => { if (!seen.has(w) && pool.length < 4) { seen.add(w); pool.push(w); } });
  pool = pool.slice(0, 4);

  const weak: WeakWord[] = pool.map(w => ({
    word: w,
    ...TRICKY[w],
    score: seededScore(w, 30, 58),
  }));

  const overall = Math.round(lines.reduce((a, l) => a + l.score, 0) / lines.length);
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
