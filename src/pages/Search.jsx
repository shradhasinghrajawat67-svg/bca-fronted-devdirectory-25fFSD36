import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useCommunity from '../hooks/useCommunity';
import useDebounce from '../hooks/useDebounce';
import { SKILLS, TOPICS } from '../utils/helpers';
import UserCard from '../components/UserCard';
import PostCard from '../components/PostCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';

const CHIPS = [...new Set([...TOPICS, ...SKILLS])];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [tab, setTab] = useState(params.get('tab') || 'people');
  const [topic, setTopic] = useState('');
  const q = useDebounce(query, 200).trim().toLowerCase();
  const { loading, error, retry, users, posts, byId } = useCommunity();

  const people = useMemo(() => users.filter((u) =>
    (!q || [u.name, u.username, u.headline, u.company.name, u.location, ...u.skills].join(' ').toLowerCase().includes(q)) &&
    (!topic || u.skills.includes(topic))), [users, q, topic]);
  const articles = useMemo(() => posts.filter((p) =>
    (!q || `${p.title} ${p.body} ${p.tags.join(' ')}`.toLowerCase().includes(q)) &&
    (!topic || p.tags.includes(topic))), [posts, q, topic]);

  const changeTab = (t) => { setTab(t); setParams({ tab: t, ...(query && { q: query }) }, { replace: true }); };

  return (
    <div className="container page">
      <h1>Discover</h1>
      <label className="field search">
        <span>Search people, skills, companies and articles</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try “React”, “Leanne” or “DevOps”" autoFocus />
      </label>
      <div className="tags" aria-label="Filter by topic">
        {CHIPS.map((c) => (
          <button key={c} className="chip chip-btn" aria-pressed={topic === c} onClick={() => setTopic(topic === c ? '' : c)}>{c}</button>
        ))}
      </div>
      <div className="tabs" role="tablist">
        <button role="tab" className="tab" aria-selected={tab === 'people'} onClick={() => changeTab('people')}>People ({people.length})</button>
        <button role="tab" className="tab" aria-selected={tab === 'articles'} onClick={() => changeTab('articles')}>Articles ({articles.length})</button>
      </div>
      {error && <AlertBanner message={error} onRetry={retry} />}
      {loading && <SkeletonLoader />}
      {!loading && !error && tab === 'people' && (people.length
        ? <div className="grid">{people.map((u) => <UserCard key={u.id} user={u} />)}</div>
        : <p className="empty">No people match. Try a different name or clear the topic filter.</p>)}
      {!loading && !error && tab === 'articles' && (articles.length
        ? <div className="feed narrow-feed">{articles.slice(0, 40).map((p) => <PostCard key={p.id} post={p} author={byId[p.userId]} />)}</div>
        : <p className="empty">No articles match. Try a different keyword or clear the topic filter.</p>)}
    </div>
  );
}
