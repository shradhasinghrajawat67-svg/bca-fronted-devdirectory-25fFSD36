import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useToast } from '../context/ToastContext';
import { IDEAS, INTERESTS, LEVELS } from '../data/ideas';
import { recommend } from '../lib/ideas';
import SkillPicker from '../components/SkillPicker';
import ProgressBar from '../components/ProgressBar';

export default function Ideas() {
  const { user, isAuthenticated } = useAuth();
  const { projects, saveProject, savedIdeas, toggleIdea } = useSocial();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [skills, setSkills] = useState(() => (params.get('skills') ? params.get('skills').split(',').filter(Boolean) : user?.skills || []));
  const [interests, setInterests] = useState([]);
  const [level, setLevel] = useState(() => (LEVELS.includes(params.get('level')) ? params.get('level') : 'Beginner'));
  const [onlySaved, setOnlySaved] = useState(false);
  const [surprise, setSurprise] = useState(null);

  const results = useMemo(() => recommend({ skills, interests, level }), [skills, interests, level]);
  // Ideas that are saved or randomly picked may not appear in the ranked results, so give them neutral details.
  const bare = (i) => results.find((r) => r.id === i.id) || { ...i, matchedSkills: [], matchedInterests: [], toLearn: i.skills, match: 0, levelFit: i.level === level ? 'exact' : 'near' };
  const list = onlySaved ? IDEAS.filter((i) => savedIdeas.includes(i.id)).map(bare) : results;
  const shown = surprise ? [bare(IDEAS.find((i) => i.id === surprise))] : list;

  const toggleInterest = (i) => setInterests((l) => (l.includes(i) ? l.filter((x) => x !== i) : [...l, i]));
  const rollDice = () => {
    const pool = results.length ? results.slice(0, 6) : IDEAS;
    setSurprise(pool[Math.floor(Math.random() * pool.length)].id);
  };

  const startProject = (idea) => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: '/ideas' } } });
    if (projects.some((p) => p.ideaId === idea.id)) return toast('You already added this idea to your projects.', 'info');
    saveProject({
      id: `p-${Date.now()}`, ideaId: idea.id, title: idea.title, summary: idea.summary, role: 'Solo developer', status: 'In progress',
      year: new Date().getFullYear(), stack: idea.skills.slice(0, 6), github: '', demo: '', screenshots: [], createdAt: Date.now(),
    });
    toast(`“${idea.title}” added to your projects as in progress.`, 'success');
  };

  return (
    <div className="container page">
      <h1>Project Idea Generator</h1>
      <p className="lead">Choose your skills, interests and level. DevSphere ranks {IDEAS.length} curated project ideas by how well they fit you.</p>

      <div className="ideas-layout">
        <aside className="card form ideas-filters">
          <SkillPicker value={skills} onChange={(s) => { setSkills(s); setSurprise(null); }} label="Your skills" max={20} />
          <fieldset>
            <legend>Interests</legend>
            <div className="tags">
              {INTERESTS.map((i) => <button key={i} type="button" className="chip chip-btn" aria-pressed={interests.includes(i)} onClick={() => { toggleInterest(i); setSurprise(null); }}>{i}</button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend>Difficulty</legend>
            <div className="seg" role="radiogroup" aria-label="Difficulty">
              {LEVELS.map((l) => <button key={l} type="button" role="radio" aria-checked={level === l} className="seg-btn" onClick={() => { setLevel(l); setSurprise(null); }}>{l}</button>)}
            </div>
          </fieldset>
          <div className="btn-row">
            <button className="btn btn-primary btn-sm" onClick={rollDice}>Surprise me</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setSkills([]); setInterests([]); setSurprise(null); setOnlySaved(false); }}>Reset</button>
          </div>
          {isAuthenticated && <label className="check"><input type="checkbox" checked={onlySaved} onChange={(e) => { setOnlySaved(e.target.checked); setSurprise(null); }} /> Show only saved ideas ({savedIdeas.length})</label>}
        </aside>

        <section aria-live="polite">
          <p className="muted">
            {surprise ? <>Showing a random pick. <button className="link-btn" onClick={() => setSurprise(null)}>Show all matches</button></> : `${shown.length} idea${shown.length === 1 ? '' : 's'} found`}
          </p>
          {shown.length === 0 && (
            <p className="empty">{onlySaved ? 'You have not saved any ideas yet.' : 'No ideas match yet. Add a skill or an interest, or try a different difficulty.'}</p>
          )}
          <div className="idea-grid">
            {shown.map((idea) => (
              <article key={idea.id} className="card idea">
                <header>
                  <h3>{idea.title}</h3>
                  <span className="match" title="How well this idea fits your skills, interests and level">{idea.match}% match</span>
                </header>
                <ProgressBar value={idea.match} label={`${idea.title} match`} />
                <p>{idea.summary}</p>
                <div className="tags">
                  <span className="chip chip-accent-solid">{idea.level}</span>
                  <span className="chip">~{idea.hours} hours</span>
                  {idea.levelFit !== 'exact' && <span className="chip chip-warn">Different level</span>}
                  {idea.matchedInterests.map((i) => <span key={i} className="chip">{i}</span>)}
                </div>
                <h4>Tech</h4>
                <div className="tags">
                  {idea.skills.map((s) => <span key={s} className={`chip ${idea.matchedSkills.includes(s) ? 'chip-ok' : ''}`}>{idea.matchedSkills.includes(s) ? '✓ ' : ''}{s}</span>)}
                </div>
                {idea.toLearn.length > 0 && skills.length > 0 && <p className="muted">You will also learn: {idea.toLearn.join(', ')}</p>}
                <details>
                  <summary>Features and a stretch goal</summary>
                  <ul className="plain-bullets">{idea.features.map((f) => <li key={f}>{f}</li>)}</ul>
                  <p><strong>Stretch goal:</strong> {idea.stretch}</p>
                </details>
                <div className="btn-row">
                  <button className="btn btn-primary btn-sm" onClick={() => startProject(idea)}>Start this project</button>
                  <button className="btn btn-ghost btn-sm" aria-pressed={savedIdeas.includes(idea.id)} onClick={() => (isAuthenticated ? toggleIdea(idea.id) : navigate('/login', { state: { from: { pathname: '/ideas' } } }))}>
                    {savedIdeas.includes(idea.id) ? 'Saved' : 'Save idea'}
                  </button>
                </div>
              </article>
            ))}
          </div>
          {isAuthenticated && projects.some((p) => p.ideaId) && <p className="muted">Started projects appear in <Link to="/projects">My projects</Link>.</p>}
        </section>
      </div>
    </div>
  );
}
