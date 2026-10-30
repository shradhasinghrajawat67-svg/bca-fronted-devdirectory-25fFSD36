import { useState } from 'react';
import { achievementArt, certificateArt, TONES } from '../lib/art';

const monthYear = () => new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const newId = () => `DS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

// Turns a few details into a shareable certificate or achievement image for a post.
export default function CertMaker({ name, onCreate }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ type: 'certification', title: '', issuer: '', date: monthYear(), tone: 'blue', stat: '' });
  const [working, setWorking] = useState(false);
  const set = (e) => setF((p) => ({ ...p, [e.target.name]: e.target.value }));
  const ok = f.title.trim().length >= 3 && (f.type === 'achievement' || f.issuer.trim().length >= 2);

  const make = () => {
    setWorking(true);
    setTimeout(() => {
      const id = newId();
      const cover = f.type === 'certification'
        ? certificateArt({ title: f.title.trim(), issuer: f.issuer.trim(), name: name || 'Your name', date: f.date, credentialId: id, tone: f.tone })
        : achievementArt({ title: f.title.trim(), subtitle: f.issuer.trim(), stat: f.stat.trim(), tone: f.tone });
      onCreate({ cover, kind: f.type, cert: f.type === 'certification' ? { issuer: f.issuer.trim(), id, date: f.date, name: f.title.trim() } : null, title: f.title.trim(), issuer: f.issuer.trim() });
      setWorking(false);
    }, 650);
  };

  if (!open) return <button type="button" className="btn btn-outline cert-open" onClick={() => setOpen(true)}>✨ Create certificate or achievement image</button>;
  return (
    <fieldset className="cert-maker">
      <legend>Image generator</legend>
      <label className="field"><span>Type</span>
        <select name="type" value={f.type} onChange={set}><option value="certification">Certification</option><option value="achievement">Achievement</option></select></label>
      <label className="field"><span>{f.type === 'certification' ? 'Certificate name' : 'Achievement title'}</span>
        <input name="title" value={f.title} onChange={set} maxLength={60} placeholder={f.type === 'certification' ? 'AWS Certified Developer' : 'Won the campus hackathon'} /></label>
      <label className="field"><span>{f.type === 'certification' ? 'Issued by' : 'Short subtitle (optional)'}</span>
        <input name="issuer" value={f.issuer} onChange={set} maxLength={60} /></label>
      {f.type === 'certification'
        ? <label className="field"><span>Date</span><input name="date" value={f.date} onChange={set} maxLength={24} /></label>
        : <label className="field"><span>Highlight (optional)</span><input name="stat" value={f.stat} onChange={set} maxLength={24} placeholder="1st of 120 teams" /></label>}
      <div className="swatches" role="radiogroup" aria-label="Colour">
        {Object.entries(TONES).map(([k, [a, b]]) => (
          <button key={k} type="button" role="radio" aria-checked={f.tone === k} aria-label={k} className="swatch" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} onClick={() => setF((p) => ({ ...p, tone: k }))} />
        ))}
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn-primary btn-sm" disabled={!ok || working} onClick={make}>{working ? 'Rendering…' : 'Generate image'}</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Close</button>
      </div>
    </fieldset>
  );
}
