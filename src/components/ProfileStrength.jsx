import { Link } from 'react-router-dom';
import { profileStrength } from '../lib/strength';
import ProgressBar from './ProgressBar';

export default function ProfileStrength({ profile, projectCount, compact = false, showList = true }) {
  const s = profileStrength(profile, projectCount);
  const tone = s.score >= 80 ? 'ok' : s.score >= 50 ? 'accent' : 'warn';
  return (
    <section className="card strength" aria-label="Profile strength">
      <div className="strength-head">
        <h2>Profile strength</h2>
        <strong className="strength-score">{s.score}%</strong>
      </div>
      <ProgressBar value={s.score} label="Profile completeness" tone={tone} />
      <p className="strength-msg"><span className="chip">{s.level}</span> {s.message}</p>
      {!compact && showList && (
        <ul className="checklist">
          {s.checks.map((c) => (
            <li key={c.id} className={c.ratio >= 1 ? 'done' : ''}>
              <span aria-hidden="true">{c.ratio >= 1 ? '✓' : c.ratio > 0 ? '◐' : '○'}</span>
              <span>{c.label}</span>
              <small className="muted">{c.ratio >= 1 ? `+${c.weight}` : `${Math.round(c.weight * c.ratio)}/${c.weight}`}</small>
            </li>
          ))}
        </ul>
      )}
      {compact && s.missing[0] && <Link to={s.missing[0].to} className="btn btn-outline btn-sm">Improve profile</Link>}
    </section>
  );
}
