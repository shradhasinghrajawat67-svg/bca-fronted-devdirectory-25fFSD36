import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import AlertBanner from '../components/AlertBanner';
import SkillPicker from '../components/SkillPicker';
import ProfileStrength from '../components/ProfileStrength';
import { resizeImage } from '../lib/image';
import { normUrl } from '../lib/url';

const buildProfile = (v) => ({
  name: v.name.trim(), headline: v.headline.trim(), location: v.location.trim(), about: v.about.trim(), avatar: v.avatar, skills: v.skills,
  experience: v.title.trim() || v.company.trim() ? [{ title: v.title.trim(), company: v.company.trim(), years: v.years.trim() }] : [],
  education: v.school.trim() ? [{ school: v.school.trim(), degree: v.degree.trim(), years: '' }] : [],
  links: { github: v.github.trim(), website: v.website.trim(), linkedin: v.linkedin.trim() },
});

// One form for both "Create your profile" (/signup) and "Edit profile" (/profile/edit).
export default function Signup() {
  const { user, isAuthenticated, signup, updateProfile } = useAuth();
  const { projects } = useSocial();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editing = location.pathname === '/profile/edit';
  const [v, setV] = useState(() => ({
    email: '', password: '', name: user?.name || '', headline: user?.headline || '', location: user?.location || '',
    about: user?.about || '', avatar: user?.avatar || '', skills: user?.skills || [],
    title: user?.experience?.[0]?.title || '', company: user?.experience?.[0]?.company || '', years: user?.experience?.[0]?.years || '',
    school: user?.education?.[0]?.school || '', degree: user?.education?.[0]?.degree || '',
    github: user?.links?.github || '', website: user?.links?.website || '', linkedin: user?.links?.linkedin || '',
  }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const draft = useMemo(() => buildProfile(v), [v]);

  if (!editing && isAuthenticated) return <Navigate to="/" replace />;

  const set = (e) => { setV((p) => ({ ...p, [e.target.name]: e.target.value })); setErrors((p) => ({ ...p, [e.target.name]: '' })); };
  const pickAvatar = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const avatar = await resizeImage(file, { max: 320, quality: 0.82 });
      setV((p) => ({ ...p, avatar }));
      setErrors((p) => ({ ...p, avatar: '' }));
    } catch (err) {
      setErrors((p) => ({ ...p, avatar: err.message }));
    }
  };

  const validate = () => {
    const e = {};
    if (!editing) {
      if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = 'Enter a valid email address.';
      if (v.password.length < 6) e.password = 'Use at least 6 characters.';
    }
    if (v.name.trim().length < 2) e.name = 'Enter your full name.';
    if (v.headline.trim().length < 5) e.headline = 'Add a headline, e.g. “Frontend Engineer at Acme”.';
    if (v.about.length > 300) e.about = 'Keep your bio under 300 characters.';
    if (v.github.trim() && !/^[A-Za-z0-9-]{1,39}$/.test(v.github.trim()) && !normUrl(v.github)) e.github = 'Use your GitHub username, for example “octocat”.';
    if (v.linkedin.trim() && /\s/.test(v.linkedin.trim())) e.linkedin = 'Use your LinkedIn username without spaces.';
    if (v.website.trim() && !normUrl(v.website)) e.website = 'Enter a valid website, for example https://you.dev.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      setFormError('Please fix the highlighted fields.');
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    const profile = { ...draft, links: { ...draft.links, website: draft.links.website ? normUrl(draft.links.website) : '' } };
    if (editing) {
      updateProfile(profile);
      toast('Profile saved.', 'success');
      navigate('/users/me');
      return;
    }
    const err = signup({ ...profile, email: v.email, password: v.password });
    if (err) setFormError(err);
    else navigate(location.state?.from?.pathname || '/', { replace: true });
  };

  const text = (name, label, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <input name={name} value={v[name]} onChange={set} aria-invalid={Boolean(errors[name])} {...props} />
      {errors[name] && <small className="field-error">{errors[name]}</small>}
    </label>
  );

  return (
    <div className={editing ? 'container page edit-wrap' : 'auth-wrap'}>
      {!editing && (
        <div className="auth-brand">
          <h1>Create your DevSphere profile</h1>
          <p>Tell the community who you are. You can change everything later.</p>
        </div>
      )}
      <section className={`card auth-card ${editing ? 'edit-card' : 'auth-wide'}`}>
        {editing && <h1>Edit your profile</h1>}
        {formError && <AlertBanner type="error" message={formError} onDismiss={() => setFormError('')} />}
        <form className="form" onSubmit={handleSubmit} noValidate>
          {!editing && (
            <fieldset><legend>Account</legend>
              {text('email', 'Email', { type: 'email', placeholder: 'you@company.com', autoComplete: 'email' })}
              {text('password', 'Password', { type: 'password', autoComplete: 'new-password' })}
            </fieldset>
          )}
          <fieldset><legend>About you</legend>
            <div className="avatar-pick">
              <Avatar user={{ name: v.name || 'You', avatar: v.avatar }} size={72} />
              <div className="field"><span>Profile photo</span>
                <input type="file" accept="image/*" onChange={pickAvatar} aria-label="Profile photo" />
                {v.avatar && <button type="button" className="link-btn" onClick={() => setV((p) => ({ ...p, avatar: '' }))}>Remove photo</button>}
                {errors.avatar && <small className="field-error">{errors.avatar}</small>}</div>
            </div>
            {text('name', 'Full name', { autoComplete: 'name' })}
            {text('headline', 'Headline', { placeholder: 'Frontend Engineer at Acme' })}
            {text('location', 'Location', { placeholder: 'Jaipur, India' })}
            <label className="field"><span>Bio</span>
              <textarea name="about" rows="4" value={v.about} onChange={set} maxLength={320} aria-invalid={Boolean(errors.about)} placeholder="What do you build and what are you curious about?" />
              <small className={errors.about ? 'field-error' : 'muted'}>{errors.about || `${v.about.length}/300`}</small></label>
          </fieldset>
          <fieldset><legend>Skills</legend>
            <SkillPicker value={v.skills} onChange={(skills) => setV((p) => ({ ...p, skills }))} label="Your skills" />
          </fieldset>
          <fieldset><legend>Experience and education</legend>
            {text('title', 'Current role')}{text('company', 'Company')}{text('years', 'Years', { placeholder: '2022 – Present' })}
            {text('school', 'School')}{text('degree', 'Degree')}
          </fieldset>
          <fieldset><legend>Contact links</legend>
            {text('github', 'GitHub username', { placeholder: 'octocat' })}
            {text('linkedin', 'LinkedIn username')}
            {text('website', 'Website', { placeholder: 'https://you.dev' })}
          </fieldset>
          <div className="form-actions">
            {editing && <Link to="/users/me" className="btn btn-ghost">Cancel</Link>}
            <button className="btn btn-primary" type="submit">{editing ? 'Save changes' : 'Create profile'}</button>
          </div>
        </form>
        {!editing && <p className="muted">Already have an account? <Link to="/login">Log in</Link></p>}
      </section>
      {editing && (
        <aside className="edit-side">
          <ProfileStrength profile={draft} projectCount={projects.length} />
          <p className="muted">The meter updates as you type. Projects are added from <Link to="/projects">My projects</Link>.</p>
        </aside>
      )}
    </div>
  );
}
