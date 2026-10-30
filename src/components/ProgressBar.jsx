export default function ProgressBar({ value, label, tone = 'accent' }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="progress" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={`progress-fill tone-${tone}`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 96, label }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - 12) / 2, c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={`${label || 'Progress'}: ${v}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" />
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-fill" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span>{v}%</span>
    </div>
  );
}
