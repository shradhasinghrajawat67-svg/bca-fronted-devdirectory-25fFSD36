import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import useCommunity from '../hooks/useCommunity';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { cardLink, decodeCard, handleOf, tokenFromHash } from '../lib/card';
import { sampleProjects } from '../lib/projects';
import IdentityCard from '../components/IdentityCard';
import ProfileStrength from '../components/ProfileStrength';
import SkeletonLoader from '../components/SkeletonLoader';

// /card shows your own card. /card/:handle is the public route that people reach by scanning the QR code.
export default function CardPage() {
  const { handle } = useParams();
  const { hash } = useLocation();
  const { user } = useAuth();
  const { projects } = useSocial();
  const { loading, users } = useCommunity();

  const token = tokenFromHash(hash);
  const snapshot = useMemo(() => (token ? decodeCard(token) : null), [token]);
  const isOwn = !handle || (user && handleOf(user) === handle && !snapshot);
  const known = useMemo(() => (handle && !snapshot ? users.find((u) => u.id !== 'me' && (handleOf(u) === handle.toLowerCase() || u.id === handle)) : null), [users, handle, snapshot]);

  let content;
  if (snapshot) {
    content = (
      <>
        <IdentityCard profile={snapshot} projects={snapshot.projects} url={`${window.location.origin}${window.location.pathname}${hash}`} />
        <p className="muted">This card was shared with you as a snapshot. <Link to="/signup">Join DevSphere</Link> to create your own.</p>
      </>
    );
  } else if (isOwn && user) {
    const titles = projects.map((p) => p.title);
    content = (
      <>
        <IdentityCard profile={user} avatar={user.avatar} projects={titles} url={cardLink(user, projects, window.location.origin)} />
        <div className="card-tips">
          <ProfileStrength profile={user} projectCount={projects.length} compact />
          <p className="muted">The card updates automatically when you edit your <Link to="/profile/edit">profile</Link> or <Link to="/projects">projects</Link>. Send someone the link again after you change it.</p>
        </div>
      </>
    );
  } else if (isOwn) {
    content = <p className="empty"><Link to="/login" state={{ from: { pathname: '/card' } }}>Log in</Link> to see your identity card.</p>;
  } else if (loading) {
    content = <SkeletonLoader variant="row" count={2} />;
  } else if (known) {
    content = (
      <>
        <IdentityCard profile={known} avatar={known.avatar} projects={sampleProjects(known).map((p) => p.title)} url={`${window.location.origin}/card/${handleOf(known)}`} />
        <p><Link to={`/users/${known.id}`} className="btn btn-outline">View full profile</Link></p>
      </>
    );
  } else {
    content = (
      <>
        <h2>Card not found</h2>
        <p className="muted">We could not find a developer for this link. If the card was shared from another device, ask for the full link or QR code again.</p>
        <Link to="/users" className="btn btn-primary">Browse developers</Link>
      </>
    );
  }

  return (
    <div className="container page card-page">
      <h1>{isOwn && !snapshot ? 'My identity card' : 'Developer identity card'}</h1>
      {isOwn && !snapshot && <p className="lead">A shareable card with your skills, projects and a QR code. Anyone who scans it lands on your public card.</p>}
      {content}
    </div>
  );
}
