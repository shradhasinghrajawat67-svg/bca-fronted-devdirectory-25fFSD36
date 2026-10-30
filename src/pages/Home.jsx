import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useCommunity from '../hooks/useCommunity';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useToast } from '../context/ToastContext';
import { baseLikes, baseShares } from '../lib/engage';
import { normSkill } from '../data/roles';
import PostCard from '../components/PostCard';
import AiBrief from '../components/AiBrief';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';
import Avatar from '../components/Avatar';
import FollowButton from '../components/FollowButton';
import GrowthCard from '../components/GrowthCard';

const FILTERS = ['Latest', 'Following', 'Trending', 'Saved'];
const MAX_UPDATE = 280;

function UpdateComposer() {
  const { user } = useAuth();
  const { addPost } = useSocial();
  const toast = useToast();
  const [text, setText] = useState('');
  const [err, setErr] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (t.length < 3) return setErr('Write at least a few words.');
    if (t.length > MAX_UPDATE) return setErr(`Updates can be at most ${MAX_UPDATE} characters.`);
    const tags = [...new Set([...t.matchAll(/#([A-Za-z][\w+.#-]{1,20})/g)].map((m) => m[1][0].toUpperCase() + m[1].slice(1)))].slice(0, 3);
    addPost({ id: `l-${Date.now()}`, userId: 'me', kind: 'update', title: t.length > 60 ? `${t.slice(0, 57)}…` : t, body: t, description: '', tags, date: new Date().toISOString(), status: 'published' });
    setText('');
    setErr('');
    toast('Update shared with your followers.', 'success');
  };

  return (
    <form className="card composer" onSubmit={submit} noValidate>
      <Avatar user={user} size={40} />
      <div className="comment-input">
        <label className="sr-only" htmlFor="update-box">Share an update</label>
        <textarea id="update-box" rows="2" value={text} placeholder={`What are you building, ${user.name.split(' ')[0]}? Use #tags to add topics.`} aria-invalid={Boolean(err)}
          onChange={(e) => { setText(e.target.value); setErr(''); }} />
        <div className="comment-row">
          <small className={err ? 'field-error' : 'muted'}>{err || `${text.trim().length}/${MAX_UPDATE}`}</small>
          <span className="btn-row"><Link to="/add-post" className="btn btn-ghost btn-sm">Write an article</Link><button className="btn btn-primary btn-sm" type="submit" disabled={!text.trim()}>Post update</button></span>
        </div>
      </div>
    </form>
  );
}

export default function Home() {
  const { loading, error, retry, users, posts, byId } = useCommunity();
  const { user, isAuthenticated } = useAuth();
  const { has, follows, bookmarks, likes, shares } = useSocial();
  const [filter, setFilter] = useState('Latest');

  const feed = useMemo(() => {
    if (filter === 'Following') return posts.filter((p) => has('follows', p.userId));
    if (filter === 'Saved') return posts.filter((p) => has('bookmarks', p.id));
    if (filter === 'Trending') {
      const heat = (p) => baseLikes(p.id) + baseShares(p.id) * 2 + (likes.includes(p.id) ? 1 : 0) + (shares[p.id] || 0) * 2;
      return [...posts].sort((a, b) => heat(b) - heat(a));
    }
    return posts;
  }, [posts, filter, has, likes, shares]);

  const topics = useMemo(() => {
    const c = {};
    posts.forEach((p) => p.tags.forEach((t) => { c[t] = (c[t] || 0) + 1; }));
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [posts]);

  // Suggestions are ranked by how many skills you share with each developer.
  const suggestions = useMemo(() => {
    const mySkills = new Set((user?.skills || []).map(normSkill));
    return users
      .filter((u) => u.id !== 'me' && !has('follows', u.id))
      .map((u) => ({ u, shared: u.skills.filter((s) => mySkills.has(normSkill(s))) }))
      .sort((a, b) => b.shared.length - a.shared.length)
      .slice(0, 4);
  }, [users, user, has]);

  const stats = [['Developers', users.length], ['Articles', posts.length], ['Following', follows.length], ['Saved', bookmarks.length]];

  return (
    <div className="container page">
      {!isAuthenticated && (
        <section className="hero card">
          <h1>Where developers share what they build.</h1>
          <p className="lead">Create a profile, show your projects, take the weekly coding challenge and find the skills your next role needs.</p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary">Create your profile</Link>
            <Link to="/login" className="btn btn-outline">Log in</Link>
          </div>
        </section>
      )}

      <dl className="stats">
        {stats.map(([label, n]) => (
          <div className="stat card" key={label}><dt>{label}</dt><dd>{loading ? <span className="skeleton skeleton-stat" /> : n}</dd></div>
        ))}
      </dl>

      <div className="shell">
        <aside className="side">
          {isAuthenticated && (
            <div className="card side-me">
              <Avatar user={user} size={64} />
              <h3>{user.name}</h3>
              <p className="muted">{user.headline}</p>
              <Link to="/users/me" className="btn btn-outline btn-sm">View profile</Link>
            </div>
          )}
          {isAuthenticated && <GrowthCard />}
          <div className="card">
            <h3>Trending topics</h3>
            <ul className="plain-list">
              {topics.map(([t, n]) => (
                <li key={t}><Link to={`/search?tab=articles&q=${encodeURIComponent(t)}`}>{t}</Link><span className="muted">{n} posts</span></li>
              ))}
            </ul>
          </div>
        </aside>

        <section aria-label="Feed">
          {isAuthenticated && <UpdateComposer />}
          {!loading && !error && <AiBrief posts={posts} byId={byId} />}
          <div className="tabs" role="tablist">
            {FILTERS.map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} className="tab" onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          {error && <AlertBanner message={error} onRetry={retry} />}
          {loading && <SkeletonLoader variant="row" count={4} />}
          {!loading && !error && (feed.length ? (
            <div className="feed">{feed.slice(0, 30).map((p) => <PostCard key={p.id} post={p} author={byId[p.userId]} />)}</div>
          ) : (
            <p className="empty">{filter === 'Following' ? 'Follow a few developers and their posts will show up here.' : filter === 'Saved' ? 'Posts you save will appear here.' : 'Nothing here yet.'}</p>
          ))}
        </section>

        <aside className="side">
          <div className="card">
            <h3>Who to follow</h3>
            <ul className="plain-list">
              {suggestions.map(({ u, shared }) => (
                <li key={u.id}>
                  <Link to={`/users/${u.id}`} className="mini-user"><Avatar user={u} size={32} /><span>{u.name}{shared.length > 0 && <small className="muted block">{shared.length} shared skill{shared.length > 1 ? 's' : ''}</small>}</span></Link>
                  <FollowButton userId={u.id} name={u.name} />
                </li>
              ))}
              {!suggestions.length && !loading && <li className="muted">You follow everyone. Nice!</li>}
            </ul>
          </div>
          <div className="card">
            <h3>Grow your skills</h3>
            <p className="muted">Compare yourself with a target role, or get a project idea that fits what you know.</p>
            <div className="btn-row"><Link to="/skill-gap" className="btn btn-primary btn-sm">Skill gap</Link><Link to="/ideas" className="btn btn-outline btn-sm">Project ideas</Link></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
