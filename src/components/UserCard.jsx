import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import FollowButton from './FollowButton';
import ConnectButton from './ConnectButton';

export default function UserCard({ user, shared = [] }) {
  return (
    <article className="card user-card">
      <Link to={`/users/${user.id}`} className="user-card-head">
        <Avatar user={user} size={56} />
        <span><strong>{user.name}</strong><small className="muted">{user.headline}</small></span>
      </Link>
      <div className="tags">
        {user.skills.map((s) => <span key={s} className={`chip ${shared.includes(s) ? 'chip-accent-solid' : ''}`}>{s}</span>)}
      </div>
      <p className="muted">{user.company.name} · {user.location}</p>
      <div className="user-card-actions">
        <Link to={`/users/${user.id}`} className="btn btn-outline btn-sm">View profile</Link>
        {user.id !== 'me' && <><FollowButton userId={user.id} name={user.name} /><ConnectButton userId={user.id} name={user.name} /></>}
      </div>
    </article>
  );
}
