import { useMemo, useState } from 'react';
import Modal from './Modal';
import ProjectForm from './ProjectForm';
import { gradientFor, STATUSES } from '../lib/projects';
import { useToast } from '../context/ToastContext';

function Cover({ project, className = '' }) {
  const shot = project.screenshots?.[0];
  return shot
    ? <img className={`project-cover ${className}`} src={shot} alt="" loading="lazy" />
    : <div className={`project-cover project-cover-fallback ${className}`} style={{ background: gradientFor(project.title) }} aria-hidden="true"><span>{project.title.slice(0, 1)}</span></div>;
}

function ProjectDetail({ project, onClose, editable, onEdit, onDelete }) {
  const [i, setI] = useState(0);
  const shots = project.screenshots || [];
  const n = shots.length;
  return (
    <Modal title={project.title} onClose={onClose} wide
      footer={editable && !project.sample ? (
        <>
          <button className="btn btn-ghost" onClick={onDelete}>Delete</button>
          <button className="btn btn-primary" onClick={onEdit}>Edit project</button>
        </>
      ) : null}>
      {n > 0 ? (
        <div className="gallery">
          <img src={shots[i]} alt={`${project.title} screenshot ${i + 1} of ${n}`} />
          {n > 1 && (
            <div className="gallery-nav">
              <button className="btn btn-ghost btn-sm" onClick={() => setI((i - 1 + n) % n)} aria-label="Previous screenshot">Previous</button>
              <span className="muted">{i + 1} / {n}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setI((i + 1) % n)} aria-label="Next screenshot">Next</button>
            </div>
          )}
        </div>
      ) : <Cover project={project} className="project-cover-lg" />}
      <p className="project-summary">{project.summary}</p>
      <dl className="facts">
        <div><dt>My role</dt><dd>{project.role}</dd></div>
        <div><dt>Status</dt><dd>{project.status}</dd></div>
        <div><dt>Year</dt><dd>{project.year}</dd></div>
      </dl>
      <h3>Technology stack</h3>
      <div className="tags">{project.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
      <div className="project-links">
        {project.github && <a className="btn btn-outline" href={project.github} target="_blank" rel="noopener noreferrer">View on GitHub</a>}
        {project.demo && <a className="btn btn-primary" href={project.demo} target="_blank" rel="noopener noreferrer">Open live demo</a>}
        {!project.github && !project.demo && <p className="muted">No links added for this project yet.</p>}
      </div>
      {project.sample && <p className="muted">Sample project shown for demonstration.</p>}
    </Modal>
  );
}

export default function ProjectShowcase({ projects, editable = false, onSave, onRemove, empty }) {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [tech, setTech] = useState('');
  const [status, setStatus] = useState('');
  const [openId, setOpenId] = useState(null);
  const [form, setForm] = useState(null); // null | {} (new) | project (edit)

  const techs = useMemo(() => [...new Set(projects.flatMap((p) => p.stack))].sort(), [projects]);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return projects.filter((p) =>
      (!tech || p.stack.includes(tech)) && (!status || p.status === status) &&
      (!s || `${p.title} ${p.summary} ${p.role} ${p.stack.join(' ')}`.toLowerCase().includes(s)));
  }, [projects, q, tech, status]);
  const open = projects.find((p) => p.id === openId);
  const hasFilters = q || tech || status;

  const save = (p) => {
    const isEdit = projects.some((x) => x.id === p.id);
    onSave(p);
    setForm(null);
    toast(isEdit ? 'Project updated.' : 'Project added to your showcase.', 'success');
  };
  const remove = (p) => {
    if (!window.confirm(`Delete “${p.title}”? This cannot be undone.`)) return;
    onRemove(p.id);
    setOpenId(null);
    toast('Project deleted.', 'info');
  };

  return (
    <section aria-label="Project showcase">
      <div className="showcase-bar">
        <label className="field search-inline"><span className="sr-only">Search projects</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects" /></label>
        <label className="field"><span className="sr-only">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Any status</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
        {editable && <button className="btn btn-primary btn-sm" onClick={() => setForm({})}>Add project</button>}
      </div>
      {techs.length > 0 && (
        <div className="tags" aria-label="Filter by technology">
          {techs.map((t) => <button key={t} className="chip chip-btn" aria-pressed={tech === t} onClick={() => setTech(tech === t ? '' : t)}>{t}</button>)}
        </div>
      )}
      {shown.length ? (
        <div className="project-grid">
          {shown.map((p) => (
            <button key={p.id} className="card project-card" onClick={() => setOpenId(p.id)} aria-label={`Open ${p.title}`}>
              <Cover project={p} />
              <span className="project-info">
                <strong>{p.title}</strong>
                <span className="muted">{p.role} · {p.year}</span>
                <span className="project-blurb">{p.summary}</span>
                <span className="tags">
                  {p.stack.slice(0, 4).map((s) => <span key={s} className="chip">{s}</span>)}
                  {p.stack.length > 4 && <span className="chip">+{p.stack.length - 4}</span>}
                </span>
                <span className={`status status-${p.status === 'Completed' ? 'done' : 'wip'}`}>{p.status}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty">
          {projects.length && hasFilters ? (
            <>No projects match these filters. <button className="link-btn" onClick={() => { setQ(''); setTech(''); setStatus(''); }}>Clear filters</button></>
          ) : (empty || 'No projects yet.')}
        </div>
      )}
      {open && (
        <ProjectDetail project={open} editable={editable} onClose={() => setOpenId(null)}
          onEdit={() => { setForm(open); setOpenId(null); }} onDelete={() => remove(open)} />
      )}
      {form && <ProjectForm initial={form.id ? form : undefined} onSave={save} onClose={() => setForm(null)} />}
    </section>
  );
}
