import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { ROLES } from '../data/roles';
import { SUGGESTIONS, reply } from '../lib/copilot';
import { profileStrength } from '../lib/strength';
import AiStream from '../components/AiStream';
import { Ring } from '../components/charts';

const SAMPLE = ['JavaScript', 'HTML', 'CSS', 'React', 'Git'];

export default function Copilot() {
  const { user, isAuthenticated } = useAuth();
  const { projects, roadmap } = useSocial();
  const [role, setRole] = useState(roadmap.role || 'Full-Stack Developer');
  const ctx = useMemo(() => ({
    name: user?.name?.split(' ')[0] || 'there',
    skills: user?.skills?.length ? user.skills : isAuthenticated ? [] : SAMPLE,
    projectCount: projects.length, role, profile: user || { skills: SAMPLE },
  }), [user, isAuthenticated, projects.length, role]);

  const [msgs, setMsgs] = useState(() => [{ id: 0, from: 'ai', ...reply('hello', { name: 'there', skills: SAMPLE, projectCount: 0, role, profile: { skills: SAMPLE } }) }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(true);
  const box = useRef(null);
  const done = useCallback(() => setBusy(false), []);

  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs]);

  const send = (q) => {
    const t = q.trim();
    if (!t || busy) return;
    setBusy(true);
    setText('');
    setMsgs((m) => [...m, { id: m.length, from: 'user', text: t }, { id: m.length + 1, from: 'ai', ...reply(t, ctx) }]);
  };
  const strength = profileStrength(ctx.profile, ctx.projectCount);
  const last = msgs[msgs.length - 1];

  return (
    <div className="container page">
      <header className="page-head">
        <h1><span className="ai-badge">AI</span> Career Copilot</h1>
        <p className="lead">Ask about your next skills, projects, profile or interviews. Answers are generated on your device from your real profile data.</p>
      </header>
      {!isAuthenticated && <p className="notice-soft">You are using a sample profile. <Link to="/signup">Create your profile</Link> for personalised answers.</p>}

      <div className="copilot-grid">
        <section className="card chat" aria-label="Chat with Career Copilot">
          <div className="chat-log" ref={box}>
            {msgs.map((m) => (
              m.from === 'user'
                ? <div key={m.id} className="msg msg-user">{m.text}</div>
                : (
                  <div key={m.id} className="msg msg-ai">
                    <div className="msg-head"><span className="ai-badge">AI</span><small className="muted">Copilot · confidence {m.confidence}%</small></div>
                    <AiStream steps={m.steps} text={m.text} onDone={m === last ? done : undefined} />
                  </div>
                )
            ))}
          </div>
          {!busy && last.chips?.length > 0 && (
            <div className="chips-row" aria-label="Suggested follow-ups">
              {last.chips.map((c) => <button key={c} className="chip chip-btn" onClick={() => send(c)}>{c}</button>)}
            </div>
          )}
          <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(text); }}>
            <label className="sr-only" htmlFor="ask">Ask Copilot</label>
            <input id="ask" value={text} onChange={(e) => setText(e.target.value)} placeholder={busy ? 'Copilot is thinking…' : 'Ask anything about your growth…'} disabled={busy} maxLength={200} />
            <button className="btn btn-primary" type="submit" disabled={busy || !text.trim()}>Send</button>
          </form>
        </section>

        <aside className="side-stack">
          <div className="card ctx-card">
            <h2>What Copilot sees</h2>
            <Ring value={strength.score} label="Profile strength" sub={strength.level} size={118} />
            <p className="muted">Skills</p>
            <div className="tags">{ctx.skills.length ? ctx.skills.map((s) => <span key={s} className="chip">{s}</span>) : <span className="muted">No skills yet</span>}</div>
            <label className="field"><span>Target role</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {Object.keys(ROLES).map((r) => <option key={r}>{r}</option>)}
              </select></label>
          </div>
          <div className="card">
            <h2>Try asking</h2>
            <div className="chips-col">{SUGGESTIONS.map((s) => <button key={s} className="chip chip-btn" disabled={busy} onClick={() => send(s)}>{s}</button>)}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
