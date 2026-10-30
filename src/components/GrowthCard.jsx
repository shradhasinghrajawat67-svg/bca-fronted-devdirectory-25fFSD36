import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { analyzeGap, buildRoadmap, roadmapProgress } from '../lib/skillGap';
import { challengeFor, weekIndexOf, totalPoints } from '../lib/challenge';
import { profileStrength } from '../lib/strength';
import ProgressBar from './ProgressBar';

// A small "your growth" summary for the home page.
export default function GrowthCard() {
  const { user } = useAuth();
  const { projects, roadmap, results } = useSocial();
  const strength = profileStrength(user, projects.length);
  const week = weekIndexOf();
  const done = results[week];
  const gap = roadmap.role ? analyzeGap(roadmap.role, user.skills) : null;
  const prog = gap ? roadmapProgress(buildRoadmap(gap), roadmap.done) : null;

  return (
    <div className="card growth">
      <h3>Your growth</h3>
      <div className="growth-row">
        <div className="growth-line"><span>Profile</span><strong>{strength.score}%</strong></div>
        <ProgressBar value={strength.score} label="Profile strength" tone={strength.score >= 80 ? 'ok' : 'accent'} />
        {strength.score < 100 && <Link to={strength.missing[0].to}>{strength.missing[0].hint[0].toUpperCase() + strength.missing[0].hint.slice(1)}</Link>}
      </div>
      <div className="growth-row">
        <div className="growth-line"><span>{gap ? gap.role : 'Skill gap'}</span><strong>{gap ? `${gap.percent}%` : '—'}</strong></div>
        {gap ? <ProgressBar value={gap.percent} label="Skill match" /> : null}
        <Link to="/skill-gap">{gap ? `Roadmap ${prog.percent}% done` : 'Pick a target role'}</Link>
      </div>
      <div className="growth-row">
        <div className="growth-line"><span>Weekly challenge</span><strong>{done ? `${done.points} pts` : 'Open'}</strong></div>
        <Link to="/challenges">{done ? `Done: ${challengeFor(week).title}` : `Play: ${challengeFor(week).title}`}</Link>
        <small className="muted">{totalPoints(results).toLocaleString()} total points</small>
      </div>
    </div>
  );
}
