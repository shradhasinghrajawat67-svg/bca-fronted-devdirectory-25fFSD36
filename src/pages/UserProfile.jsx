import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getPostsByUser, getUserById, errorMessage } from '../services/postService';
import { enrichUser, linkUrl, meAsUser, normalizePost, seed } from '../utils/helpers';
import { sampleProjects } from '../lib/projects';
import { handleOf } from '../lib/card';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import Avatar from '../components/Avatar';
import FollowButton from '../components/FollowButton';
import ConnectButton from '../components/ConnectButton';
import PostCard from '../components/PostCard';
import ProjectShowcase from '../components/ProjectShowcase';
import ProfileStrength from '../components/ProfileStrength';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';

export default function UserProfile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const { posts: mine, projects: myProjects, follows, connections, saveProject, removeProject, has, connStatus } = useSocial();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [topic, setTopic] = useState('All');
  const [tab, setTab] = useState('posts');
  const isMe = id === 'me';

  useEffect(() => {
    let off = false;
    setTopic('All');
    setError('');
    if (isMe) {
      if (me) { setProfile(meAsUser(me)); setPosts(mine); }
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setProfile(null);
    Promise.all([getUserById(id), getPostsByUser(id)])
      .then(([u, p]) => { if (!off) { setProfile(enrichUser(u)); setPosts(p.map(normalizePost)); } })
      .catch((err) => !off && setError(errorMessage(err)))
      .finally(() => !off && setLoading(false));
    return () => { off = true; };
  }, [id, attempt, isMe, isMe ? me : null, isMe ? mine : null]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setTab('posts'), [id]);

  const projects = useMemo(() => (isMe ? myProjects : profile ? sampleProjects(profile) : []), [isMe, myProjects, profile]);
  const counts = useMemo(() => {
    const c = {};
    posts.forEach((p) => p.tags.forEach((t) => { c[t] = (c[t] || 0) + 1; }));
    return Object.entries(c);
  }, [posts]);
  const shown = topic === 'All' ? posts : posts.filter((p) => p.tags.includes(topic));

  if (isMe && !me) return <Navigate to="/login" replace state={{ from: { pathname: '/users/me' } }} />;

  const stats = profile && (isMe
    ? [['Posts', posts.length], ['Connections', Object.values(connections).filter((c) => c.status === 'connected').length], ['Following', follows.length]]
    : [['Posts', posts.length],
      ['Followers', 40 + ((seed(profile.id) * 13) % 400) + (has('follows', profile.id) ? 1 : 0)],
      ['Connections', 20 + ((seed(profile.id) * 7) % 300) + (connStatus(profile.id) === 'connected' ? 1 : 0)]]);

  return (
    <div className="container page">
      <Link to="/users" className="back-link">Back to developers</Link>
      {error && <AlertBanner message={error} onRetry={() => setAttempt((a) => a + 1)} />}
      {loading && <SkeletonLoader variant="row" count={4} />}

      {profile && (
        <>
          <section className="card profile-hero">
            <div className="cover" />
            <div className="profile-hero-body">
              <Avatar user={profile} size={112} />
              <div className="profile-id">
                <h1>{profile.name}</h1>
                <p>{profile.headline}</p>
                <p className="muted">{profile.location}</p>
                <ul className="stat-row">{stats.map(([l, n]) => <li key={l}><strong>{n}</strong> <span className="muted">{l}</span></li>)}</ul>
              </div>
              <div className="btn-row">
                {isMe ? (
                  <>
                    <Link to="/profile/edit" className="btn btn-primary">Edit profile</Link>
                    <Link to="/card" className="btn btn-outline">Identity card</Link>
                  </>
                ) : (
                  <>
                    <FollowButton userId={profile.id} name={profile.name} />
                    <ConnectButton userId={profile.id} name={profile.name} />
                    <Link to={`/card/${handleOf(profile)}`} className="btn btn-ghost btn-sm">Identity card</Link>
                  </>
                )}
              </div>
            </div>
          </section>

          <div className="profile-grid">
            <div className="profile-side">
              {isMe && <ProfileStrength profile={me} projectCount={myProjects.length} compact />}
              <section className="card"><h2>About</h2><p>{profile.about || 'No bio yet.'}</p></section>
              <section className="card">
                <h2>Skills</h2>
                <div className="tags">{profile.skills.length ? profile.skills.map((s) => <span key={s} className="chip">{s}</span>) : <span className="muted">No skills added yet.</span>}</div>
                {isMe && <Link to="/skill-gap" className="btn btn-outline btn-sm">Analyse my skill gap</Link>}
              </section>
              <section className="card">
                <h2>Experience</h2>
                {profile.experience.length ? profile.experience.map((x, i) => (
                  <div className="timeline" key={i}><strong>{x.title || 'Role'}</strong><span>{x.company}</span><small className="muted">{x.years}</small></div>
                )) : <p className="muted">Nothing added yet.</p>}
                <h2>Education</h2>
                {profile.education.length ? profile.education.map((x, i) => (
                  <div className="timeline" key={i}><strong>{x.school}</strong><span>{x.degree}</span></div>
                )) : <p className="muted">Nothing added yet.</p>}
              </section>
              <section className="card">
                <h2>Contact</h2>
                <ul className="plain-list">
                  {profile.email && <li><a href={`mailto:${profile.email}`}>Email</a><span className="muted">{profile.email}</span></li>}
                  {Object.entries(profile.links || {}).filter(([, v]) => v).map(([k, v]) => (
                    <li key={k}><a href={linkUrl(k, v)} target="_blank" rel="noopener noreferrer">{k[0].toUpperCase() + k.slice(1)}</a><span className="muted">{String(v).replace(/^https?:\/\//, '')}</span></li>
                  ))}
                </ul>
              </section>
            </div>

            <div>
              <div className="tabs" role="tablist">
                <button role="tab" className="tab" aria-selected={tab === 'posts'} onClick={() => setTab('posts')}>Posts ({posts.length})</button>
                <button role="tab" className="tab" aria-selected={tab === 'projects'} onClick={() => setTab('projects')}>Projects ({projects.length})</button>
              </div>

              {tab === 'posts' && (
                <>
                  {counts.length > 0 && (
                    <section className="card">
                      <h2>Topics</h2>
                      <div className="tags">
                        <button className="chip chip-btn" aria-pressed={topic === 'All'} onClick={() => setTopic('All')}>All ({posts.length})</button>
                        {counts.map(([t, n]) => (
                          <button key={t} className="chip chip-btn" aria-pressed={topic === t} onClick={() => setTopic(t)}>{t} ({n})</button>
                        ))}
                      </div>
                    </section>
                  )}
                  {shown.length ? (
                    <div className="feed">{shown.map((p) => <PostCard key={p.id} post={p} author={profile} />)}</div>
                  ) : (
                    <p className="empty">{isMe ? <>You haven’t posted anything yet. <Link to="/add-post">Write your first article</Link> or share an update from the home page.</> : `${profile.name} hasn’t posted anything yet.`}</p>
                  )}
                </>
              )}

              {tab === 'projects' && (
                <ProjectShowcase projects={projects} editable={isMe} onSave={saveProject} onRemove={removeProject}
                  empty={isMe ? 'You have not added any projects. Add two to boost your profile strength.' : `${profile.name} has not added any projects yet.`} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
