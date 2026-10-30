import { CHALLENGES } from '../data/challenges';

export const TIME_LIMIT = 6 * 60; // seconds
const DAY = 86400000;
const WEEK = 7 * DAY;
const EPOCH = Date.UTC(2024, 0, 1); // a Monday, so every week runs Monday to Sunday (UTC)

export const weekIndexOf = (now = Date.now()) => Math.floor((now - EPOCH) / WEEK);
export const weekBounds = (idx) => ({ start: EPOCH + idx * WEEK, end: EPOCH + (idx + 1) * WEEK });
export const challengeFor = (idx) => CHALLENGES[((idx % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length];
export const weekNumber = (idx) => idx + 1;

export const fmtClock = (s) => {
  const t = Math.max(0, Math.round(s));
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};
export const fmtCountdown = (ms) => {
  const m = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
  return d ? `${d}d ${h}h` : h ? `${h}h ${mm}m` : `${mm}m`;
};

// 100 points per correct answer, plus up to 20% of that for finishing early.
export function scoreAttempt(challenge, answers, remaining, limit = TIME_LIMIT) {
  const total = challenge.questions.length;
  const correct = challenge.questions.filter((q, i) => answers[i] === q.answer).length;
  const base = correct * 100;
  const left = Math.min(Math.max(remaining, 0), limit);
  const bonus = Math.round(base * 0.2 * (left / limit));
  return { correct, total, base, bonus, points: base + bonus, secondsUsed: Math.round(limit - left), remainingRatio: left / limit };
}

export const BADGES = [
  { id: 'first', icon: '\u2605', name: 'First Steps', desc: 'Finish your first weekly challenge.' },
  { id: 'perfect', icon: '\u25C6', name: 'Perfect Score', desc: 'Answer every question correctly.' },
  { id: 'speed', icon: '\u26A1', name: 'Speed Runner', desc: 'Score 4 or more with over half the time left.' },
  { id: 'streak', icon: '\u2735', name: 'Three-Week Streak', desc: 'Finish challenges in 3 weeks in a row.' },
  { id: 'centurion', icon: '\u25CE', name: 'Point Collector', desc: 'Earn 1,000 points in total.' },
];

export function computeBadges(results = {}) {
  const list = Object.entries(results).map(([w, r]) => ({ week: Number(w), ...r }));
  const weeks = new Set(list.map((r) => r.week));
  let streak = false;
  for (const w of weeks) if (weeks.has(w + 1) && weeks.has(w + 2)) streak = true;
  const earned = {
    first: list.length > 0,
    perfect: list.some((r) => r.correct === r.total && r.total > 0),
    speed: list.some((r) => r.correct >= 4 && r.remainingRatio > 0.5),
    streak,
    centurion: list.reduce((n, r) => n + r.points, 0) >= 1000,
  };
  return BADGES.map((b) => ({ ...b, earned: earned[b.id] }));
}

export const totalPoints = (results = {}) => Object.values(results).reduce((n, r) => n + r.points, 0);

// Demo developers so the leaderboard feels alive. Scores are deterministic per week.
export const RIVALS = [
  { id: '1', name: 'Leanne Graham', email: 'Sincere@april.biz' }, { id: '2', name: 'Ervin Howell', email: 'Shanna@melissa.tv' },
  { id: '3', name: 'Clementine Bauch', email: 'Nathan@yesenia.net' }, { id: '4', name: 'Patricia Lebsack', email: 'Julianne.OConner@kory.org' },
  { id: '5', name: 'Chelsey Dietrich', email: 'Lucio_Hettinger@annie.ca' }, { id: '6', name: 'Dennis Schulist', email: 'Karley_Dach@jasper.info' },
  { id: '7', name: 'Kurtis Weissnat', email: 'Telly.Hoeger@billy.biz' }, { id: '8', name: 'Nicholas Runolfsdottir', email: 'Sherwood@rosamond.me' },
  { id: '9', name: 'Glenna Reichert', email: 'Chaim_McDermott@dana.io' }, { id: '10', name: 'Clementina DuBuque', email: 'Rey.Padberg@karina.biz' },
];
const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const rivalWeekPoints = (r, w) => {
  const h = hash(`${r.id}:${w}`);
  if (h % 5 === 0) return 0; // sometimes a developer skips a week
  return 120 + (h % 440);
};

export function leaderboard(currentWeek, myResults, me, scope = 'week') {
  const weeksBack = scope === 'week' ? [currentWeek] : Array.from({ length: Math.min(currentWeek + 1, 8) }, (_, i) => currentWeek - i);
  const rows = RIVALS.map((r) => ({ ...r, points: weeksBack.reduce((n, w) => n + rivalWeekPoints(r, w), 0), isMe: false }));
  if (me) {
    const pts = weeksBack.reduce((n, w) => n + (myResults[w]?.points || 0), 0);
    rows.push({ id: 'me', name: me.name, email: me.email, avatar: me.avatar, points: pts, isMe: true });
  }
  return rows.filter((r) => r.points > 0 || r.isMe)
    .sort((a, b) => b.points - a.points || (a.isMe ? 1 : -1))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
