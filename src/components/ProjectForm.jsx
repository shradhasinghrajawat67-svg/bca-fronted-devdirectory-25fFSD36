import { useState } from 'react';
import Modal from './Modal';
import SkillPicker from './SkillPicker';
import { ALL_SKILLS } from '../data/roles';
import { STATUSES } from '../lib/projects';
import { normUrl } from '../lib/url';
import { resizeImage } from '../lib/image';

const TECH = [...new Set([...ALL_SKILLS, 'Vite', 'Express', 'MongoDB', 'PostgreSQL', 'Tailwind CSS', 'Vue', 'Angular', 'Flutter', 'Java', 'Go', 'C#', 'Django', 'Flask'])].sort();
const MAX_SHOTS = 3;

export default function ProjectForm({ initial, onSave, onClose }) {
  const [v, setV] = useState(() => ({
    title: '', summary: '', role: '', status: 'Completed', stack: [], github: '', demo: '', screenshots: [],
    ...initial,
    year: String(initial?.year || new Date().getFullYear()),
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (e) => setV((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (v.title.trim().length < 3) e.title = 'Give the project a title of at least 3 characters.';
    if (v.title.trim().length > 60) e.title = 'Keep the title under 60 characters.';
    if (v.summary.trim().length < 20) e.summary = 'Describe the project in at least 20 characters.';
    if (v.summary.trim().length > 400) e.summary = 'Keep the description under 400 characters.';
    if (v.role.trim().length < 2) e.role = 'Tell us what your role was.';
    if (!v.stack.length) e.stack = 'Add at least one technology.';
    const y = Number(v.year);
    if (!Number.isInteger(y) || y < 1990 || y > new Date().getFullYear() + 1) e.year = 'Enter a valid year.';
    if (v.github.trim() && !normUrl(v.github, { github: true })) e.github = 'Enter a valid link, for example github.com/you/project.';
    if (v.demo.trim() && !normUrl(v.demo)) e.demo = 'Enter a valid link, for example https://myapp.com.';
    return e;
  };

  const addShots = async (e) => {
    const files = [...e.target.files].slice(0, MAX_SHOTS - v.screenshots.length);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    try {
      const imgs = await Promise.all(files.map((f) => resizeImage(f, { max: 1000, quality: 0.75 })));
      setV((p) => ({ ...p, screenshots: [...p.screenshots, ...imgs].slice(0, MAX_SHOTS) }));
      setErrors((p) => ({ ...p, screenshots: '' }));
    } catch (err) {
      setErrors((p) => ({ ...p, screenshots: err.message }));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({
      id: initial?.id || `p-${Date.now()}`,
      title: v.title.trim(), summary: v.summary.trim(), role: v.role.trim(), status: v.status, year: Number(v.year),
      stack: v.stack, github: normUrl(v.github, { github: true }), demo: normUrl(v.demo), screenshots: v.screenshots,
      createdAt: initial?.createdAt || Date.now(),
    });
  };

  const field = (name, label, props = {}) => (
    <label className="field"><span>{label}</span>
      <input name={name} value={v[name]} onChange={set} aria-invalid={Boolean(errors[name])} {...props} />
      {errors[name] && <small className="field-error">{errors[name]}</small>}
    </label>
  );

  return (
    <Modal title={initial?.id ? 'Edit project' : 'Add a project'} onClose={onClose} wide>
      <form className="form" onSubmit={submit} noValidate>
        {field('title', 'Project title *', { placeholder: 'Portfolio Builder', maxLength: 70 })}
        <label className="field"><span>Description *</span>
          <textarea name="summary" rows="3" value={v.summary} onChange={set} maxLength={420} aria-invalid={Boolean(errors.summary)} placeholder="What does it do and what problem does it solve?" />
          {errors.summary ? <small className="field-error">{errors.summary}</small> : <small className="muted">{v.summary.trim().length}/400</small>}
        </label>
        <div className="two-col">
          {field('role', 'Your role *', { placeholder: 'Lead developer' })}
          <label className="field"><span>Status</span>
            <select name="status" value={v.status} onChange={set}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
          {field('year', 'Year', { inputMode: 'numeric', maxLength: 4 })}
        </div>
        <SkillPicker label="Technology stack *" value={v.stack} onChange={(stack) => setV((p) => ({ ...p, stack }))} suggestions={TECH} max={10} placeholder="React, Node.js…" error={errors.stack} />
        <div className="two-col">
          {field('github', 'GitHub link', { placeholder: 'github.com/you/project' })}
          {field('demo', 'Live demo link', { placeholder: 'https://myapp.com' })}
        </div>
        <div className="field"><span>Screenshots (up to {MAX_SHOTS})</span>
          <div className="shots">
            {v.screenshots.map((s, i) => (
              <div className="shot" key={i}>
                <img src={s} alt={`Screenshot ${i + 1}`} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setV((p) => ({ ...p, screenshots: p.screenshots.filter((_, j) => j !== i) }))}>Remove</button>
              </div>
            ))}
          </div>
          {v.screenshots.length < MAX_SHOTS && <input type="file" accept="image/*" multiple onChange={addShots} disabled={busy} />}
          {busy && <small className="muted">Processing images…</small>}
          {errors.screenshots && <small className="field-error">{errors.screenshots}</small>}
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit" disabled={busy}>{initial?.id ? 'Save changes' : 'Add project'}</button>
        </div>
      </form>
    </Modal>
  );
}
