import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getComments, getPostById, getUserById, errorMessage } from '../services/postService';
import { enrichUser, fmtDate, mdToHtml, meAsUser, normalizePost, readTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import FollowButton from '../components/FollowButton';
import ConnectButton from '../components/ConnectButton';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';
import PostActions from '../components/PostActions';
import CommentSection from '../components/CommentSection';

export default function Article() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user: me } = useAuth();
  const { posts: mine, deletePost } = useSocial();
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const isLocal = id.startsWith('l-');

  useEffect(() => {
    let off = false;
    setError('');
    if (isLocal) {
      const p = mine.find((x) => x.id === id);
      setPost(p || null);
      setAuthor(me ? meAsUser(me) : null);
      setComments([]);
      if (!p) setError('That article does not exist on this device (404).');
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    getPostById(id)
      .then(async (raw) => {
        const [u, c] = await Promise.all([getUserById(raw.userId), getComments(id)]);
        if (off) return;
        setPost(normalizePost(raw));
        setAuthor(enrichUser(u));
        setComments(c);
      })
      .catch((e) => !off && setError(errorMessage(e)))
      .finally(() => !off && setLoading(false));
    return () => { off = true; };
    // `mine` only matters for local posts; API posts are fetched once per id/attempt.
  }, [id, attempt, isLocal, isLocal ? mine : null, isLocal ? me : null]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = () => {
    if (!window.confirm('Delete this article? This cannot be undone.')) return;
    deletePost(post.id);
    toast('Article deleted.', 'info');
    navigate('/users/me');
  };

  return (
    <div className="container page article-page">
      <Link to="/" className="back-link">Back to feed</Link>
      {error && <AlertBanner message={error} onRetry={isLocal ? undefined : () => setAttempt((a) => a + 1)} />}
      {loading && <SkeletonLoader variant="row" count={3} />}
      {post && (
        <article className="card article">
          {post.cover && <img className="article-cover" src={post.cover} alt={post.coverAlt || ''} />}
          {post.cert && <p className="cert-strip">✔ Verified credential · <strong>{post.cert.issuer}</strong> · ID {post.cert.id} · {post.cert.date}</p>}
          <h1>{post.title}</h1>
          {author && (
            <div className="article-author">
              <Link to={`/users/${author.id}`} className="post-author"><Avatar user={author} size={44} /><span><strong>{author.name}</strong><small>{author.headline}</small></span></Link>
              {author.id !== 'me'
                ? <span className="btn-row"><FollowButton userId={author.id} name={author.name} /><ConnectButton userId={author.id} name={author.name} /></span>
                : <span className="btn-row"><Link to={`/posts/${post.id}/edit`} className="btn btn-outline btn-sm">Edit</Link><button className="btn btn-ghost btn-sm" onClick={remove}>Delete</button></span>}
            </div>
          )}
          <p className="muted">{fmtDate(post.date)} · {readTime(post.body)} min read {post.status === 'draft' && <span className="chip chip-warn">Draft</span>}</p>
          <div className="tags">{post.tags.map((t) => <Link key={t} className="chip" to={`/search?tab=articles&q=${encodeURIComponent(t)}`}>{t}</Link>)}</div>
          <div className="prose" dangerouslySetInnerHTML={{ __html: mdToHtml(post.body) }} />
          <PostActions post={post} commentsOpen onToggleComments={() => document.getElementById('discussion')?.scrollIntoView({ behavior: 'smooth' })} />
          <h2 id="discussion">Discussion</h2>
          <CommentSection postId={post.id} apiComments={comments} />
        </article>
      )}
    </div>
  );
}
