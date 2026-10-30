import { useMemo, useState } from 'react';
import AiStream from './AiStream';
import { baseLikes } from '../lib/engage';

// A short "daily brief" the app writes from the posts currently in the feed.
export default function AiBrief({ posts, byId }) {
  const [hidden, setHidden] = useState(false);
  const text = useMemo(() => {
    const counts = {};
    posts.forEach((p) => p.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0]);
    const certs = posts.filter((p) => p.kind === 'certification').length;
    const wins = posts.filter((p) => p.kind === 'achievement').length;
    const hot = [...posts].sort((a, b) => baseLikes(b.id) - baseLikes(a.id))[0];
    const who = hot && byId[hot.userId]?.name;
    return `**${posts.length} posts** are in your feed today. The most active topics are **${top.join(', ')}**.\n\n- ${certs} new certifications and ${wins} achievements were shared\n${hot ? `- Most appreciated: **${hot.title}**${who ? ` by ${who}` : ''}` : ''}`;
  }, [posts, byId]);

  if (hidden || !posts.length) return null;
  return (
    <section className="card ai-brief" aria-label="Daily brief">
      <div className="assistant-head"><span className="ai-badge">AI</span><strong>Your daily brief</strong>
        <button type="button" className="link-btn" onClick={() => setHidden(true)}>Hide</button></div>
      <AiStream fast steps={['Scanning the feed', 'Clustering topics', 'Ranking by engagement']} text={text} />
    </section>
  );
}
