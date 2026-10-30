import { useEffect, useRef, useState } from 'react';
import { mdToHtml } from '../utils/helpers';

const reduced = () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

// Shows an "AI at work" sequence: reasoning steps tick off one by one, then the answer streams in.
// Everything is computed locally in the browser; there is no external AI service.
export default function AiStream({ steps = [], text = '', onDone, fast = false }) {
  const skip = useRef(reduced()).current;
  const [stage, setStage] = useState(skip ? steps.length : 0);
  const [n, setN] = useState(skip ? text.length : 0);
  const finished = stage >= steps.length && n >= text.length;
  const called = useRef(false);

  useEffect(() => {
    if (stage >= steps.length) return undefined;
    const t = setTimeout(() => setStage((s) => s + 1), fast ? 260 : 560);
    return () => clearTimeout(t);
  }, [stage, steps.length, fast]);

  useEffect(() => {
    if (stage < steps.length || n >= text.length) return undefined;
    const t = setTimeout(() => setN((x) => Math.min(text.length, x + 3)), 14);
    return () => clearTimeout(t);
  }, [stage, steps.length, n, text]);

  useEffect(() => {
    if (finished && !called.current) { called.current = true; onDone?.(); }
  }, [finished, onDone]);

  const visible = steps.slice(0, Math.min(stage + 1, steps.length));
  return (
    <div className="ai-stream" aria-live="polite">
      {steps.length > 0 && (
        <ul className="ai-steps">
          {visible.map((s, i) => (
            <li key={s} className={i < stage ? 'done' : 'active'}>
              <span className="ai-dot" aria-hidden="true">{i < stage ? '✓' : ''}</span>{s}
            </li>
          ))}
        </ul>
      )}
      {stage >= steps.length && (finished
        ? <div className="ai-answer prose" dangerouslySetInnerHTML={{ __html: mdToHtml(text) }} />
        : <p className="ai-typing">{text.slice(0, n)}<span className="ai-caret" aria-hidden="true" /></p>)}
    </div>
  );
}
