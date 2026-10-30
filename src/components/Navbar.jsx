import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import UserMenu from './UserMenu';

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const cls = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  const submit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand"><span className="brand-mark" aria-hidden="true" />DevSphere</Link>
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end className={cls}>Home</NavLink>
          <NavLink to="/search" className={cls}>Discover</NavLink>
          <NavLink to="/users" className={cls}>Developers</NavLink>
          <NavLink to="/challenges" className={cls}>Challenge</NavLink>
          <NavLink to="/skill-gap" className={cls}>Skill Gap</NavLink>
          <NavLink to="/ideas" className={cls}>Ideas</NavLink>
          <NavLink to="/copilot" className={cls}><span className="ai-badge ai-badge-sm">AI</span> Copilot</NavLink>
          <NavLink to="/insights" className={cls}>Insights</NavLink>
          <NavLink to="/add-post" className={cls}>Write</NavLink>
        </nav>
        <form className="nav-search" onSubmit={submit} role="search">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people and articles" aria-label="Search" />
        </form>
        <ThemeSwitcher />
        <div className="nav-session">
          {isAuthenticated ? <UserMenu /> : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Join</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
