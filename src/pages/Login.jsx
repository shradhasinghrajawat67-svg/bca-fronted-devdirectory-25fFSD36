import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/AlertBanner';

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Send people back to the page they originally tried to open.
  const from = location.state?.from ? `${location.state.from.pathname}${location.state.from.search || ''}` : '/';
  if (isAuthenticated) return <Navigate to={from} replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = login(form);
    if (err) setError(err);
    else navigate(from, { replace: true });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-brand">
        <h1>DevSphere</h1>
        <p>Your engineering network: profiles, articles and the people behind them.</p>
      </div>
      <section className="card auth-card">
        <h2>Welcome back</h2>
        {location.state?.from && <p className="muted">Log in to open <code>{location.state.from.pathname}</code>.</p>}
        {error && <AlertBanner message={error} onDismiss={() => setError('')} />}
        <form className="form" onSubmit={handleSubmit}>
          <label className="field"><span>Email</span>
            <input type="email" required autoFocus value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" /></label>
          <label className="field"><span>Password</span>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <button className="btn btn-primary" type="submit">Log in</button>
        </form>
        <p className="muted">New here? <Link to="/signup" state={location.state}>Create your profile</Link></p>
      </section>
    </div>
  );
}
