import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useToast } from '../context/ToastContext';
import { avatarFor, fmtDate } from '../utils/helpers';
import Avatar from './Avatar';

const MAX = 300;

// Local comments are stored per account. The article page also passes the public API comments.
export default function CommentSection({ postId, apiComments = [] }) {
  const { user, isAuthenticated } = useAuth();
  const { comments, addComment, deleteComment } = useSocial();
  const toast = useToast();
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const mine = comments[postId] || [];

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return setErr('Write something before posting.');
    if (t.length > MAX) return setErr(`Comments can be at most ${MAX} characters.`);
    addComment(postId, t);
    setText('');
    setErr('');
    toast('Comment posted.', 'success');
  };

  return (
    <section className="comments-box" aria-label="Comments">
      {isAuthenticated ? (
        <form className="comment-form" onSubmit={submit} noValidate>
          <Avatar user={user} size={32} />
          <div className="comment-input">
            <label className="sr-only" htmlFor={`c-${postId}`}>Write a comment</label>
            <textarea id={`c-${postId}`} rows="2" value={text} maxLength={MAX + 50} placeholder="Add a comment…" aria-invalid={Boolean(err)}
              onChange={(e) => { setText(e.target.value); setErr(''); }} />
            <div className="comment-row">
              <small className={err ? 'field-error' : 'muted'}>{err || `${text.trim().length}/${MAX}`}</small>
              <button className="btn btn-primary btn-sm" type="submit" disabled={!text.trim()}>Post comment</button>
            </div>
          </div>
        </form>
      ) : (
        <p className="muted"><Link to="/login" state={{ from: { pathname: `/posts/${postId}` } }}>Log in</Link> to join the conversation.</p>
      )}
      <ul className="comments">
        {mine.slice().reverse().map((c) => (
          <li key={c.id}>
            <Avatar user={user || { name: 'You' }} size={32} />
            <div>
              <strong>{user?.name || 'You'}</strong> <small className="muted">{fmtDate(c.date)}</small>
              <p>{c.text}</p>
              <button type="button" className="link-btn" onClick={() => { deleteComment(postId, c.id); toast('Comment deleted.', 'info'); }}>Delete</button>
            </div>
          </li>
        ))}
        {apiComments.map((c) => (
          <li key={`api-${c.id}`}>
            <Avatar user={{ name: c.name, avatar: avatarFor(c.email) }} size={32} />
            <div><strong>{c.name}</strong> <small className="muted">Developer</small><p>{c.body}</p></div>
          </li>
        ))}
      </ul>
      {!mine.length && !apiComments.length && <p className="muted">No comments yet. Be the first to reply.</p>}
    </section>
  );
}
