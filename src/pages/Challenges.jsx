import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import ProgressBar from '../components/ProgressBar';
import { TIME_LIMIT, challengeFor, computeBadges, fmtClock, fmtCountdown, leaderboard, scoreAttempt, totalPoints, weekBounds, weekIndexOf, weekNumber } from '../lib/challenge';
import { avatarFor } from '../utils/helpers';

function Leaderboard({ week, results, user }) {
  const [scope, setScope] = useState('week');
  const me = user ? { name: user.name, email: user.email, avatar: user.avatar } : null;
  const rows = useMemo(() => leaderboard(week, results, me, scope), [week, results, scope, user]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="card" aria-label="Leaderboard">
      <div className="lb-head">
        <h2>Leaderboard</h2>
        <div className="tabs tabs-tight" role="tablist">
          <button role="tab" className="tab" aria-selected={scope === 'week'} onClick={() => setScope('week')}>This week</button>
          <button role="tab" className="tab" aria-selected={scope === 'all'} onClick={() => setScope('all')}>Last 8 weeks</button>
        </div>
      </div>
      <ol className="lb">
        {rows.slice(0, 10).map((r) => (
          <li key={r.id} className={r.isMe ? 'lb-me' : ''}>
            <span className="lb-rank">{r.rank}</span>
            <Avatar user={{ name: r.name, avatar: r.isMe ? r.avatar : avatarFor(r.email) }} size={32} />
            {r.isMe ? <strong>{r.name} (you)</strong> : <Link to={`/users/${r.id}`}>{r.name}</Link>}
            <span className="lb-pts">{r.points.toLocaleString()} pts</span>
          </li>
        ))}
      </ol>
      {user && !rows.slice(0, 10).some((r) => r.isMe) && (() => {
        const mine = rows.find((r) => r.isMe);
        return mine ? <p className="muted">Your rank: #{mine.rank} with {mine.points} pts</p> : null;
      })()}
      {!user && <p className="muted">Log in and take the challenge to join the leaderboard.</p>}
    </section>
  );
}

function Badges({ results }) {
  const badges = computeBadges(results);
  return (
    <section className="card" aria-label="Badges">
      <h2>Badges ({badges.filter((b) => b.earned).length}/{badges.length})</h2>
      <ul className="badges">
        {badges.map((b) => (
          <li key={b.id} className={b.earned ? 'badge earned' : 'badge'} title={b.desc}>
            <span className="badge-icon" aria-hidden="true">{b.icon}</span>
            <span><strong>{b.name}</strong><small className="muted block">{b.earned ? 'Earned' : b.desc}</small></span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Review({ challenge, result }) {
  return (
    <ol className="review">
      {challenge.questions.map((q, i) => {
        const pick = result.answers[i];
        const ok = pick === q.answer;
        return (
          <li key={i} className={ok ? 'ok' : 'bad'}>
            <p><strong>{q.q}</strong> <span className={ok ? 'tag-ok' : 'tag-bad'}>{ok ? 'Correct' : pick == null ? 'Skipped' : 'Incorrect'}</span></p>
            {q.code && <pre className="code"><code>{q.code}</code></pre>}
            <p className="muted">{!ok && pick != null && <>Your answer: {q.options[pick]}. </>}Correct answer: <strong>{q.options[q.answer]}</strong></p>
            <p>{q.why}</p>
          </li>
        );
      })}
    </ol>
  );
}

export default function Challenges() {
  const { user, isAuthenticated } = useAuth();
  const { results, attempt, setAttempt, saveResult } = useSocial();
  const toast = useToast();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => Date.now());
  const [qi, setQi] = useState(0);
  const submitting = useRef(false);

  const week = weekIndexOf(now);
  const challenge = challengeFor(week);
  const { end } = weekBounds(week);
  const result = results[week];
  const active = attempt && attempt.week === week && !result ? attempt : null;
  const remaining = active ? TIME_LIMIT - (now - active.startedAt) / 1000 : TIME_LIMIT;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  // A leftover attempt from an earlier week is discarded.
  useEffect(() => {
    if (attempt && (attempt.week !== week || results[attempt.week])) setAttempt(null);
  }, [attempt, week, results, setAttempt]);

  const finish = useCallback((auto = false) => {
    if (!active || submitting.current) return;
    submitting.current = true;
    const left = Math.max(0, TIME_LIMIT - (Date.now() - active.startedAt) / 1000);
    const answers = challenge.questions.map((_, i) => (active.answers[i] ?? null));
    const score = scoreAttempt(challenge, answers, left);
    saveResult(week, { ...score, answers, finishedAt: Date.now() });
    setQi(0);
    toast(auto ? `Time is up! You scored ${score.points} points.` : `Challenge complete: ${score.points} points.`, 'success');
  }, [active, challenge, saveResult, week, toast]);

  useEffect(() => { if (!active) submitting.current = false; }, [active]);
  useEffect(() => { if (active && remaining <= 0) finish(true); }, [active, remaining, finish]);

  const start = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: '/challenges' } } });
    setQi(0);
    setAttempt({ week, startedAt: Date.now(), answers: {} });
  };
  const pick = (i) => setAttempt({ ...active, answers: { ...active.answers, [qi]: i } });

  const q = challenge.questions[qi];
  const answered = active ? Object.keys(active.answers).length : 0;
  const last = qi === challenge.questions.length - 1;

  return (
    <div className="container page">
      <h1>Weekly Coding Challenge</h1>
      <p className="lead">A new challenge every Monday. Answer five questions in {TIME_LIMIT / 60} minutes, earn points and badges, and climb the leaderboard.</p>

      <div className="challenge-grid">
        <div>
          <section className="card challenge">
            <div className="challenge-top">
              <div>
                <span className="chip">Week {weekNumber(week)} · {challenge.topic}</span>
                <h2>{challenge.title}</h2>
                <p className="muted">{challenge.blurb}</p>
              </div>
              <div className="muted challenge-next">New challenge in <strong>{fmtCountdown(end - now)}</strong></div>
            </div>

            {!active && !result && (
              <div className="challenge-intro">
                <ul className="plain-bullets">
                  <li>{challenge.questions.length} questions, one attempt per week</li>
                  <li>100 points for each correct answer</li>
                  <li>Up to 20% bonus for finishing early</li>
                  <li>The timer keeps running if you leave the page</li>
                </ul>
                <button className="btn btn-primary" onClick={start}>{isAuthenticated ? 'Start challenge' : 'Log in to start'}</button>
              </div>
            )}

            {active && (
              <div className="quiz">
                <div className="quiz-bar">
                  <span className={`timer ${remaining < 60 ? 'timer-low' : ''}`} role="timer" aria-label={`Time left ${fmtClock(remaining)}`}>{fmtClock(remaining)}</span>
                  <ProgressBar value={(answered / challenge.questions.length) * 100} label="Questions answered" />
                  <span className="muted">{answered}/{challenge.questions.length} answered</span>
                </div>
                <h3>Question {qi + 1} of {challenge.questions.length}</h3>
                <p className="quiz-q">{q.q}</p>
                {q.code && <pre className="code"><code>{q.code}</code></pre>}
                <div className="options" role="radiogroup" aria-label={q.q}>
                  {q.options.map((o, i) => (
                    <button key={i} role="radio" aria-checked={active.answers[qi] === i} className="option" onClick={() => pick(i)}>
                      <span className="option-key">{'ABCD'[i]}</span><span>{o}</span>
                    </button>
                  ))}
                </div>
                <div className="quiz-nav">
                  <button className="btn btn-ghost" disabled={qi === 0} onClick={() => setQi(qi - 1)}>Previous</button>
                  {!last
                    ? <button className="btn btn-outline" onClick={() => setQi(qi + 1)}>Next</button>
                    : <button className="btn btn-primary" onClick={() => {
                      if (answered < challenge.questions.length && !window.confirm(`You have answered ${answered} of ${challenge.questions.length}. Submit anyway?`)) return;
                      finish();
                    }}>Submit answers</button>}
                </div>
              </div>
            )}

            {result && (
              <div className="result">
                <div className="result-score">
                  <strong>{result.points}</strong><span>points</span>
                </div>
                <p>You answered <strong>{result.correct} of {result.total}</strong> correctly in {fmtClock(result.secondsUsed)}.
                  Base {result.base} + speed bonus {result.bonus}.</p>
                <h3>Review</h3>
                <Review challenge={challenge} result={result} />
                <p className="muted">Come back in {fmtCountdown(end - now)} for the next challenge.</p>
              </div>
            )}
          </section>
        </div>

        <div>
          {isAuthenticated && (
            <section className="card stat-card">
              <h2>Your points</h2>
              <p className="big-number">{totalPoints(results).toLocaleString()}</p>
              <p className="muted">{Object.keys(results).length} challenge{Object.keys(results).length === 1 ? '' : 's'} completed</p>
            </section>
          )}
          <Leaderboard week={week} results={results} user={user} />
          {isAuthenticated && <Badges results={results} />}
        </div>
      </div>
    </div>
  );
}
