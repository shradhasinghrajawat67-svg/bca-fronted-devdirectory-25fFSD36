import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-menu-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} title="Account menu">
        <Avatar user={user} size={32} />
      </button>
      {open && (
        <div className="menu card" role="menu">
          <div className="menu-head"><strong>{user.name}</strong><small className="muted">{user.email}</small></div>
          <Link role="menuitem" to="/users/me">My profile</Link>
          <Link role="menuitem" to="/profile/edit">Edit profile</Link>
          <Link role="menuitem" to="/projects">My projects</Link>
          <Link role="menuitem" to="/card">My identity card</Link>
          <Link role="menuitem" to="/network">My network</Link>
          <button role="menuitem" onClick={() => { setOpen(false); logout(); navigate('/'); }}>Log out</button>
        </div>
      )}
    </div>
  );
}
