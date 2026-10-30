import { useId, useMemo, useState } from 'react';
import { ALL_SKILLS, normSkill } from '../data/roles';

// Chip input with suggestions. Type and press Enter or comma, or click a suggestion.
export default function SkillPicker({ value, onChange, max = 15, label = 'Skills', placeholder = 'Type a skill and press Enter', suggestions = ALL_SKILLS, error }) {
  const [text, setText] = useState('');
  const id = useId();
  const have = useMemo(() => new Set(value.map(normSkill)), [value]);

  const add = (raw) => {
    const s = raw.trim().replace(/\s+/g, ' ').slice(0, 30);
    if (!s || have.has(normSkill(s)) || value.length >= max) return;
    const canon = suggestions.find((x) => normSkill(x) === normSkill(s)) || s;
    onChange([...value, canon]);
    setText('');
  };
  const remove = (s) => onChange(value.filter((x) => x !== s));
  const shown = suggestions.filter((s) => !have.has(normSkill(s)) && (!text || s.toLowerCase().includes(text.toLowerCase()))).slice(0, 10);

  return (
    <div className="field">
      <label htmlFor={id}><span>{label}</span></label>
      <div className="skill-box">
        {value.map((s) => (
          <span key={s} className="chip chip-removable">{s}
            <button type="button" aria-label={`Remove ${s}`} onClick={() => remove(s)}>×</button>
          </span>
        ))}
        <input id={id} value={text} placeholder={value.length >= max ? `Limit of ${max} reached` : placeholder} disabled={value.length >= max}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(text); }
            else if (e.key === 'Backspace' && !text && value.length) remove(value[value.length - 1]);
          }} />
      </div>
      <div className="tags" aria-label="Suggested skills">
        {shown.map((s) => <button type="button" key={s} className="chip chip-btn" onClick={() => add(s)}>+ {s}</button>)}
      </div>
      {error ? <small className="field-error">{error}</small> : <small className="muted">{value.length}/{max} skills</small>}
    </div>
  );
}
