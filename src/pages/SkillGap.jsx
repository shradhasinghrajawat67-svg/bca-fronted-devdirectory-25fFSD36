import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../data/roles';
import { analyzeGap, buildRoadmap, estimateWeeks, roadmapProgress } from '../lib/skillGap';
import SkillPicker from '../components/SkillPicker';
import ProgressBar, { ProgressRing } from '../components/ProgressBar';

export default function SkillGap() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { roadmap, setRole: saveRole, toggleStep: saveStep } = useSocial();
  const toast = useToast();
  // Guests can try the analyzer; their choices live only on this page.
  const [g, setG] = useState({ role: '', skills: [], done: [] });

  const role = isAuthenticated ? roadmap.role : g.role;
  const done = isAuthenticated ? roadmap.done : g.done;
  const skills = isAuthenticated ? user.skills : g.skills;

  const setRole = (r) => (isAuthenticated ? saveRole(r) : setG((p) => ({ ...p, role: r, done: [] })));
  const setSkills = (s) => (isAuthenticated ? updateProfile({ skills: s }) : setG((p) => ({ ...p, skills: s })));
  const toggleStep = (id) => (isAuthenticated ? saveStep(id) : setG((p) => ({ ...p, done: p.done.includes(id) ? p.done.filter((x) => x !== id) : [...p.done, id] })));

  const gap = useMemo(() => (role ? analyzeGap(role, skills) : null), [role, skills]);
  const plan = useMemo(() => buildRoadmap(gap), [gap]);
  const prog = roadmapProgress(plan, done);
  const missingCore = gap ? gap.core.missing : [];

  const learned = (skill) => {
    setSkills([...skills, skill]);
    toast(`${skill} added to your skills.`, 'success');
  };

  return (
    <div className="container page">
      <h1>Skill Gap Analyzer</h1>
      <p className="lead">Pick the role you want. DevSphere compares your skills with what that role needs and builds a step-by-step learning roadmap.</p>
      {!isAuthenticated && <p className="muted"><Link to="/login" state={{ from: { pathname: '/skill-gap' } }}>Log in</Link> to use your profile skills and save your roadmap progress.</p>}

      <h2>1. Choose a target role</h2>
      <div className="role-grid" role="radiogroup" aria-label="Target role">
        {Object.entries(ROLES).map(([name, r]) => (
          <button key={name} role="radio" aria-checked={role === name} className="card role-card" onClick={() => setRole(name)}>
            <strong>{name}</strong>
            <span className="muted">{r.blurb}</span>
            <small className="muted">{r.core.length} core · {r.bonus.length} bonus skills</small>
          </button>
        ))}
      </div>

      <h2>2. Your current skills</h2>
      <div className="card">
        <SkillPicker value={skills} onChange={setSkills} label={isAuthenticated ? 'Skills on your profile (changes save automatically)' : 'Add the skills you have'} max={30} />
      </div>

      {!gap && <p className="empty">Choose a role above to see your results.</p>}

      {gap && (
        <>
          <h2>3. Your results for {gap.role}</h2>
          <div className="gap-top">
            <section className="card gap-score">
              <ProgressRing value={gap.percent} size={132} label="Skill match" />
              <div>
                <h3>{gap.percent}% skill match</h3>
                <p className="muted">{gap.core.matched.length + gap.bonus.matched.length} of {gap.core.matched.length + gap.core.missing.length + gap.bonus.matched.length + gap.bonus.missing.length} skills covered. Core skills count double.</p>
                <p className="gap-verdict">{gap.percent >= 85 ? 'You are ready to apply.' : gap.percent >= 60 ? 'You are close. A few skills to go.' : gap.percent >= 30 ? 'A solid start. Follow the roadmap below.' : 'Everyone starts somewhere. Begin with the core skills.'}</p>
              </div>
            </section>
            <section className="card">
              <h3>You already have</h3>
              <div className="tags">
                {[...gap.core.matched, ...gap.bonus.matched].map((s) => <span key={s} className="chip chip-ok">✓ {s}</span>)}
                {!gap.core.matched.length && !gap.bonus.matched.length && <span className="muted">No matching skills yet.</span>}
              </div>
              <h3>Missing skills</h3>
              <div className="tags">
                {gap.core.missing.map((s) => <span key={s} className="chip chip-miss">{s} · core</span>)}
                {gap.bonus.missing.map((s) => <span key={s} className="chip">{s} · bonus</span>)}
                {!plan.length && <span className="muted">Nothing missing. Great work!</span>}
              </div>
              {missingCore.length > 0 && (
                <Link className="btn btn-outline btn-sm" to={`/ideas?skills=${encodeURIComponent(missingCore.slice(0, 4).join(','))}&level=Beginner`}>Find projects to practise these</Link>
              )}
            </section>
          </div>

          {plan.length > 0 && (
            <>
              <h2>4. Your personalised roadmap</h2>
              <section className="card">
                <div className="roadmap-head">
                  <div><strong>{prog.percent}% of the roadmap complete</strong><span className="muted"> · {prog.finished}/{prog.total} steps</span></div>
                  <span className="muted">About {estimateWeeks(plan, done)} weeks left at one step per week</span>
                </div>
                <ProgressBar value={prog.percent} label="Roadmap progress" tone="ok" />
              </section>
              <ol className="roadmap">
                {plan.map((item) => {
                  const finished = item.steps.every((s) => done.includes(s.id));
                  return (
                    <li key={item.skill} className="card road-item">
                      <header>
                        <h3><span className="road-n">{item.order}</span> {item.skill}</h3>
                        <span className={`chip ${item.priority === 'Core' ? 'chip-miss' : ''}`}>{item.priority}</span>
                      </header>
                      <ul className="steps">
                        {item.steps.map((s) => (
                          <li key={s.id}>
                            <label className="check">
                              <input type="checkbox" checked={done.includes(s.id)} onChange={() => toggleStep(s.id)} />
                              <span className={done.includes(s.id) ? 'struck' : ''}>{s.text}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                      {finished && <button className="btn btn-primary btn-sm" onClick={() => learned(item.skill)}>I know {item.skill} now: add to my skills</button>}
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </>
      )}
    </div>
  );
}
