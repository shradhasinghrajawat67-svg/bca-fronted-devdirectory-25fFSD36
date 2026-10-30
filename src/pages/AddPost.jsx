import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createPost, errorMessage } from '../services/postService';
import { TOPICS, mdToHtml } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import AlertBanner from '../components/AlertBanner';
import { resizeImage } from '../lib/image';
import { useToast } from '../context/ToastContext';
import CertMaker from '../components/CertMaker';
import WriteAssistant from '../components/WriteAssistant';

const LIMITS = { title: [5, 80], body: [20, 500] }; // from the lab spec
const EMPTY = { title: '', description: '', category: '', tags: '', body: '', status: 'published', featured: false, cover: '', kind: 'article', cert: null, coverAlt: '' };
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const TOOLS = [
  ['B', '**', '**', 'Bold'], ['I', '*', '*', 'Italic'], ['</>', '`', '`', 'Code'],
  ['H2', '\n## ', '', 'Heading'], ['• List', '\n- ', '', 'List'], ['Link', '[', '](https://)', 'Link'],
];

const validate = (v) => {
  const e = {};
  const t = v.title.trim().length;
  if (t < LIMITS.title[0]) e.title = `Title needs at least ${LIMITS.title[0]} characters.`;
  else if (t > LIMITS.title[1]) e.title = `Title can be at most ${LIMITS.title[1]} characters.`;
  if (!v.category) e.category = 'Choose a category.';
  const b = v.body.trim().length;
  if (b < LIMITS.body[0]) e.body = `Content needs at least ${LIMITS.body[0]} characters.`;
  else if (b > LIMITS.body[1]) e.body = `Content can be at most ${LIMITS.body[1]} characters.`;
  return e;
};

export default function AddPost() {
  const { user } = useAuth();
  const { addPost, updatePost, posts: mine } = useSocial();
  const { id: editId } = useParams();
  const existing = editId ? mine.find((p) => p.id === editId) : null;
  const navigate = useNavigate();
  const toast = useToast();
  const [v, setV] = useState(() => (existing ? {
    title: existing.title, description: existing.description || '', category: existing.tags[0] || '', tags: existing.tags.slice(1).join(', '),
    body: existing.body, status: existing.status, featured: Boolean(existing.featured), cover: existing.cover || '',
    kind: existing.kind || 'article', cert: existing.cert || null, coverAlt: existing.coverAlt || '',
  } : EMPTY));
  const [touched, setTouched] = useState({});
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const area = useRef(null);

  const errors = validate(v);
  const isValid = !Object.keys(errors).length;
  const show = (f) => touched[f] && errors[f];
  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setV((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setNotice(null);
  };
  const blur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const format = (before, after) => {
    const el = area.current;
    const { selectionStart: s, selectionEnd: e } = el;
    const next = v.body.slice(0, s) + before + v.body.slice(s, e) + after + v.body.slice(e);
    setV((p) => ({ ...p, body: next }));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, e + before.length); });
  };

  const pickCover = async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const cover = await resizeImage(f, { max: 1200, quality: 0.75 });
      setV((p) => ({ ...p, cover }));
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const addTag = (t) => setV((p) => (!p.category ? { ...p, category: t } : p.category === t || p.tags.split(',').map((x) => x.trim()).includes(t) ? p : { ...p, tags: p.tags ? `${p.tags}, ${t}` : t }));
  const makeImage = ({ cover, kind, cert, title, issuer }) => {
    setV((p) => ({
      ...p, cover, kind, cert, coverAlt: kind === 'certification' ? `Certificate: ${title}` : `Achievement: ${title}`,
      title: p.title.trim() ? p.title : kind === 'certification' ? `I earned the ${title}` : title,
      category: p.category || 'Career',
      body: p.body.trim().length >= 20 ? p.body : kind === 'certification'
        ? `I am proud to share that I earned the ${title}${issuer ? ` from ${issuer}` : ''}.\n\n- What I studied\n- What I built along the way\n- What comes next`
        : `Big milestone: ${title}.${issuer ? ` ${issuer}.` : ''}\n\n- What happened\n- What I learned\n- Thank you to everyone who helped`,
    }));
    toast('Image added as the cover of your post.', 'success');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setTouched({ title: true, category: true, body: true });
    if (!isValid) return;
    setSubmitting(true);
    setNotice(null);
    const tags = [...new Set([v.category, ...v.tags.split(',').map((t) => t.trim()).filter(Boolean)])].slice(0, 5);
    if (existing) {
      updatePost(existing.id, { title: v.title.trim(), body: v.body.trim(), description: v.description.trim(), tags, status: v.status, featured: v.featured, cover: v.cover, kind: v.kind, cert: v.cert, coverAlt: v.coverAlt, slug: slugify(v.title) });
      toast('Article updated.', 'success');
      navigate(`/posts/${existing.id}`);
      return;
    }
    try {
      // JSONPlaceholder only knows its own users, so the request uses userId 1.
      const res = await createPost({ title: v.title.trim(), body: v.body.trim(), userId: 1 });
      if (res.status !== 201) return setNotice({ type: 'error', message: `Unexpected response (${res.status}).` });
      const id = `l-${Date.now()}`;
      addPost({
        id, userId: 'me', title: v.title.trim(), body: v.body.trim(), description: v.description.trim(),
        tags,
        date: new Date().toISOString(), status: v.status, featured: v.featured, cover: v.cover, kind: v.kind, cert: v.cert, coverAlt: v.coverAlt, slug: slugify(v.title),
      });
      setNotice({ type: 'success', message: v.status === 'draft' ? 'Draft saved to your profile.' : 'Article published.', id });
      setV(EMPTY);
      setTouched({});
      setPreview(false);
    } catch (err) {
      setNotice({ type: 'error', message: errorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (editId && !existing) return <div className="container page"><h1>Article not found</h1><p className="muted">You can only edit articles you wrote on this device.</p><Link to="/" className="btn btn-primary">Back to feed</Link></div>;

  return (
    <div className="container page">
      <h1>{existing ? 'Edit article' : 'Write an article'}</h1>
      <p className="muted">Posting as {user.name}</p>
      {notice && (
        <AlertBanner type={notice.type} message={notice.message} onDismiss={() => setNotice(null)} onRetry={notice.type === 'error' ? handleSubmit : undefined} />
      )}
      {notice?.id && <p><Link to={`/posts/${notice.id}`}>Read your article</Link></p>}

      <form className="editor-grid" onSubmit={handleSubmit} noValidate>
        <div className="card form">
          <label className="field"><span>Title *</span>
            <input name="title" value={v.title} onChange={change} onBlur={blur} aria-invalid={Boolean(show('title'))} placeholder="A clear, specific title" />
            <small className={show('title') ? 'field-error' : 'muted'}>{show('title') || `${v.title.trim().length}/${LIMITS.title[1]} · slug: ${slugify(v.title) || '…'}`}</small></label>
          <label className="field"><span>Short description</span>
            <textarea name="description" rows="2" maxLength={160} value={v.description} onChange={change} placeholder="One line shown in the feed" /></label>
          <div className="field">
            <span>Content * (Markdown)</span>
            <div className="toolbar" role="toolbar" aria-label="Formatting">
              {TOOLS.map(([label, a, b, name]) => (
                <button type="button" key={name} className="btn btn-ghost btn-sm" title={name} onClick={() => format(a, b)} disabled={preview}>{label}</button>
              ))}
              <button type="button" className="btn btn-outline btn-sm" aria-pressed={preview} onClick={() => setPreview((p) => !p)}>{preview ? 'Edit' : 'Preview'}</button>
            </div>
            {preview
              ? <div className="prose preview" dangerouslySetInnerHTML={{ __html: mdToHtml(v.body) || '<p>Nothing to preview yet.</p>' }} />
              : <textarea ref={area} name="body" rows="10" value={v.body} onChange={change} onBlur={blur} aria-invalid={Boolean(show('body'))} />}
            <small className={show('body') ? 'field-error' : 'muted'}>{show('body') || `${v.body.trim().length}/${LIMITS.body[1]}`}</small>
          </div>
          <WriteAssistant title={v.title} body={v.body} onTag={addTag} onTitle={(t) => setV((p) => ({ ...p, title: t }))} />
        </div>

        <aside className="card form">
          <h2>Publish settings</h2>
          <label className="field"><span>Category *</span>
            <select name="category" value={v.category} onChange={change} onBlur={blur} aria-invalid={Boolean(show('category'))}>
              <option value="">Select category</option>
              {TOPICS.map((t) => <option key={t}>{t}</option>)}
            </select>
            {show('category') && <small className="field-error">{errors.category}</small>}</label>
          <label className="field"><span>More tags (comma separated)</span><input name="tags" value={v.tags} onChange={change} /></label>
          <label className="field"><span>Status</span>
            <select name="status" value={v.status} onChange={change}><option value="published">Published</option><option value="draft">Draft</option></select></label>
          <label className="check"><input type="checkbox" name="featured" checked={v.featured} onChange={change} /> Mark as featured</label>
          <label className="field"><span>Cover image</span><input type="file" accept="image/*" onChange={pickCover} /></label>
          <CertMaker name={user.name} onCreate={makeImage} />
          {v.cover && <><img className="post-cover" src={v.cover} alt="Cover preview" /><button type="button" className="link-btn" onClick={() => setV((p) => ({ ...p, cover: '', cert: null, kind: 'article', coverAlt: '' }))}>Remove cover</button></>}
          <button className="btn btn-primary" type="submit" disabled={!isValid || submitting}>
            {submitting ? 'Publishing…' : existing ? 'Save changes' : v.status === 'draft' ? 'Save draft' : 'Publish article'}
          </button>
        </aside>
      </form>
    </div>
  );
}
