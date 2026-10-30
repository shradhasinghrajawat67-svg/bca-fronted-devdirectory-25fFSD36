import { useState } from 'react';
import { TOPICS } from '../utils/helpers';
import AiStream from './AiStream';

const KEYWORDS = {
  React: ['react', 'component', 'hook', 'jsx', 'state'], CSS: ['css', 'style', 'layout', 'grid', 'flexbox', 'design'],
  TypeScript: ['typescript', 'type', 'types', 'interface'], 'Node.js': ['node', 'api', 'server', 'express', 'backend'],
  DevOps: ['docker', 'deploy', 'kubernetes', 'pipeline', 'cloud', 'aws', 'ci'], AI: ['ai', 'model', 'machine', 'learning', 'llm', 'data'],
  Testing: ['test', 'tests', 'testing', 'bug', 'coverage'], Career: ['career', 'job', 'interview', 'learn', 'team', 'certificate', 'promotion'],
};
const POSITIVE = ['great', 'love', 'happy', 'proud', 'excited', 'improved', 'won', 'passed', 'thank', 'faster', 'better'];

function analyse(title, body) {
  const words = body.toLowerCase().match(/[a-z']+/g) || [];
  const sentences = Math.max(1, (body.match(/[.!?]+/g) || []).length);
  const avg = words.length / sentences;
  const syll = words.reduce((n, w) => n + Math.max(1, (w.match(/[aeiouy]+/g) || []).length), 0);
  const flesch = Math.round(206.835 - 1.015 * avg - 84.6 * (syll / Math.max(words.length, 1)));
  const read = flesch >= 70 ? 'easy to read' : flesch >= 50 ? 'fairly easy' : 'dense';
  const scores = Object.entries(KEYWORDS).map(([t, ks]) => [t, words.filter((w) => ks.includes(w)).length]).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]);
  const tags = scores.slice(0, 3).map((x) => x[0]);
  const pos = words.filter((w) => POSITIVE.includes(w)).length;
  const tone = pos >= 2 ? 'positive and energetic' : pos === 1 ? 'friendly' : 'neutral and informative';
  const topic = tags[0] || 'your topic';
  const titles = [`What I learned about ${topic}`, `A practical look at ${topic}`, `${topic}: lessons from real work`];
  const advice = [];
  if (words.length < 40) advice.push('Add a few more details or an example to make the post more useful.');
  if (avg > 22) advice.push('Split long sentences. Aim for about 15 to 20 words each.');
  if (!/^[-*] /m.test(body)) advice.push('A short bullet list makes key points easier to scan.');
  if (!title.trim()) advice.push('Add a clear, specific title.');
  const text = `Your draft has **${words.length} words** and reads as **${read}** (score ${Math.max(0, Math.min(100, flesch))}/100). The tone is **${tone}**.\n\n${tags.length ? `Detected topics: **${tags.join(', ')}**.` : 'I could not detect a clear topic yet.'}\n\n${advice.length ? `## Suggestions\n${advice.map((a) => `- ${a}`).join('\n')}` : 'Looks great. Nothing to fix.'}`;
  return { text, tags, titles };
}

// Rule-based, on-device writing helper that scores a draft and suggests tags and titles.
export default function WriteAssistant({ title, body, onTag, onTitle }) {
  const [run, setRun] = useState(null);
  const [done, setDone] = useState(false);
  const ready = body.trim().length >= 20;
  const start = () => { setDone(false); setRun({ id: Date.now(), ...analyse(title, body) }); };

  return (
    <div className="assistant">
      <div className="assistant-head">
        <span className="ai-badge">AI</span><strong>Writing assistant</strong>
        <button type="button" className="btn btn-outline btn-sm" onClick={start} disabled={!ready}>{run ? 'Analyse again' : 'Analyse my draft'}</button>
      </div>
      {!ready && <small className="muted">Write at least 20 characters to unlock the analysis.</small>}
      {run && (
        <>
          <AiStream key={run.id} fast steps={['Reading your draft', 'Scoring readability', 'Detecting topics', 'Writing suggestions']} text={run.text} onDone={() => setDone(true)} />
          {done && (
            <div className="assistant-actions">
              {run.tags.filter((t) => TOPICS.includes(t)).length > 0 && <p className="muted">Add a tag:</p>}
              <div className="tags">{run.tags.filter((t) => TOPICS.includes(t)).map((t) => <button type="button" key={t} className="chip chip-btn" onClick={() => onTag(t)}>+ {t}</button>)}</div>
              <p className="muted">Title ideas:</p>
              <div className="chips-col">{run.titles.map((t) => <button type="button" key={t} className="chip chip-btn" onClick={() => onTitle(t)}>{t}</button>)}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
