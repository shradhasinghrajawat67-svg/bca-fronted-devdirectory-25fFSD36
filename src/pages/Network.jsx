import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useCommunity from '../hooks/useCommunity';
import { useSocial } from '../context/SocialContext';
import Avatar from '../components/Avatar';
import FollowButton from '../components/FollowButton';
import ConnectButton from '../components/ConnectButton';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';

export default function Network() {
  const { loading, error, retry, byId } = useCommunity();
  const { connections, follows } = useSocial();
  const [tab, setTab] = useState('connected');

  const ids = useMemo(() => ({
    connected: Object.entries(connections).filter(([, c]) => c.status === 'connected').map(([id]) => id),
    pending: Object.entries(connections).filter(([, c]) => c.status === 'pending').map(([id]) => id),
    following: follows,
  }), [connections, follows]);
  const people = ids[tab].map((id) => byId[id]).filter(Boolean);
  const labels = { connected: 'Connections', pending: 'Pending requests', following: 'Following' };

  return (
    <div className="container page narrow">
      <h1>My network</h1>
      <div className="tabs" role="tablist">
        {Object.keys(labels).map((k) => (
          <button key={k} role="tab" className="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{labels[k]} ({ids[k].length})</button>
        ))}
      </div>
      {error && <AlertBanner message={error} onRetry={retry} />}
      {loading && <SkeletonLoader variant="row" count={3} />}
      {!loading && !error && (people.length ? (
        <ul className="net-list">
          {people.map((u) => (
            <li key={u.id} className="card net-row">
              <Link to={`/users/${u.id}`} className="post-author"><Avatar user={u} size={48} /><span><strong>{u.name}</strong><small>{u.headline}</small></span></Link>
              <span className="btn-row"><FollowButton userId={u.id} name={u.name} /><ConnectButton userId={u.id} name={u.name} /></span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">{tab === 'connected' ? 'No connections yet.' : tab === 'pending' ? 'No pending requests.' : 'You are not following anyone yet.'} <Link to="/users">Find developers</Link></p>
      ))}
    </div>
  );
}
