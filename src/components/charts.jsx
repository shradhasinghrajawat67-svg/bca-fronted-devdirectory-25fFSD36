import { useEffect, useState } from 'react';

const polar = (cx, cy, r, i, n) => {
  const a = (Math.PI * 2 * i) / n - Math.PI / 2;
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
};

export function RadarChart({ axes, size = 320 }) {
  const c = size / 2; const R = size / 2 - 52; const n = axes.length;
  const pts = axes.map((a, i) => polar(c, c, (R * Math.max(a.value, 4)) / 100, i, n));
  return (
    <svg className="radar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Skill radar: ${axes.map((a) => `${a.label} ${a.value}%`).join(', ')}`}>
      {[25, 50, 75, 100].map((p) => (
        <polygon key={p} className="radar-grid" points={axes.map((_, i) => polar(c, c, (R * p) / 100, i, n).join(',')).join(' ')} />
      ))}
      {axes.map((a, i) => {
        const [x, y] = polar(c, c, R, i, n); const [lx, ly] = polar(c, c, R + 24, i, n);
        return (
          <g key={a.label}>
            <line className="radar-grid" x1={c} y1={c} x2={x} y2={y} />
            <text className="radar-label" x={lx} y={ly} textAnchor={lx < c - 4 ? 'end' : lx > c + 4 ? 'start' : 'middle'} dominantBaseline="middle">{a.label}</text>
          </g>
        );
      })}
      <polygon className="radar-area" style={{ transformOrigin: `${c}px ${c}px` }} points={pts.map((p) => p.join(',')).join(' ')} />
      {pts.map(([x, y], i) => <circle key={axes[i].label} className="radar-dot" cx={x} cy={y} r="4" />)}
    </svg>
  );
}

export function Ring({ value, size = 130, label, sub }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(value), 80); return () => clearTimeout(t); }, [value]);
  const r = size / 2 - 11; const len = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${value} out of 100`}>
        <defs><linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--accent)" /><stop offset="1" stopColor="var(--accent2)" /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" />
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-bar" strokeDasharray={len} strokeDashoffset={len * (1 - v / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="ring-num">{value}</text>
      </svg>
      <strong>{label}</strong>{sub && <small className="muted">{sub}</small>}
    </div>
  );
}

export function AreaChart({ data, labels = [], height = 190 }) {
  const w = 640; const pad = 28;
  const max = Math.max(...data, 10); const min = Math.min(...data, 0);
  const x = (i) => pad + (i * (w - pad * 2)) / Math.max(data.length - 1, 1);
  const y = (v) => height - pad - ((v - min) / Math.max(max - min, 1)) * (height - pad * 2);
  const line = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <svg className="area" viewBox={`0 0 ${w} ${height}`} role="img" aria-label={`Trend from ${data[0]} to ${data[data.length - 1]}`}>
      <defs><linearGradient id="areag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity=".45" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs>
      {[0, 1, 2, 3].map((i) => <line key={i} className="radar-grid" x1={pad} x2={w - pad} y1={pad + (i * (height - pad * 2)) / 3} y2={pad + (i * (height - pad * 2)) / 3} />)}
      <path d={`${line} L${x(data.length - 1)} ${height - pad} L${x(0)} ${height - pad} Z`} fill="url(#areag)" />
      <path className="area-line" d={line} pathLength="1" />
      {data.map((v, i) => <circle key={i} className="radar-dot" cx={x(i)} cy={y(v)} r="4"><title>{`${labels[i] || i + 1}: ${v}`}</title></circle>)}
      {labels.map((l, i) => <text key={l} className="radar-label" x={x(i)} y={height - 6} textAnchor="middle">{l}</text>)}
    </svg>
  );
}

export function Heatmap({ grid }) {
  const cell = 16; const gap = 4;
  return (
    <svg className="hm" viewBox={`0 0 ${grid.length * (cell + gap)} ${7 * (cell + gap)}`} role="img" aria-label="Activity over the last 13 weeks">
      {grid.map((week, wi) => week.map((lvl, di) => (
        <rect key={`${wi}-${di}`} className={`hm-${lvl}`} x={wi * (cell + gap)} y={di * (cell + gap)} width={cell} height={cell} rx="4"><title>{`Activity level ${lvl} of 4`}</title></rect>
      )))}
    </svg>
  );
}

export function BarList({ items }) {
  return (
    <ul className="bar-list">
      {items.map((it) => (
        <li key={it.label}>
          <span>{it.label}{it.mine && <em className="chip chip-accent">You</em>}</span>
          <div className="bar"><i style={{ width: `${it.value}%` }} className={it.mine ? 'mine' : ''} /></div>
          <b>{it.value}</b>
        </li>
      ))}
    </ul>
  );
}
