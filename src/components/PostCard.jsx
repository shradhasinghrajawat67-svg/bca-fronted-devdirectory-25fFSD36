import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fmtDate } from '../utils/helpers';
import Avatar from './Avatar';
import PostActions from './PostActions';
import CommentSection from './CommentSection';

const KIND = { certification: 'Certification', achievement: 'Achievement', project: 'Project launch' };

export default function PostCard({ post, author }) {
  const [open, setOpen] = useState(false);
  const isUpdate = post.kind === 'update';

  return (
    <article className="card post-card">
      <header className="post-meta">
        {author && (
          <Link to={`/users/${author.id}`} className="post-author">
            <Avatar user={author} size={36} />
            <span><strong>{author.name}</strong><small>{author.headline}</small></span>
          </Link>
        )}
        <time dateTime={post.date}>{fmtDate(post.date)}</time>
      </header>
      {isUpdate ? (
        <>
          <p className="update-body"><Link to={`/posts/${post.id}`}>{post.body}</Link></p>
          {post.cover && <img className="post-cover" src={post.cover} alt={post.coverAlt || ''} loading="lazy" />}
        </>
      ) : (
        <>
          <h3>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
            {post.status === 'draft' && <span className="chip chip-warn">Draft</span>}
            {post.featured && <span className="chip chip-accent">Featured</span>}
            {KIND[post.kind] && <span className={`chip kind kind-${post.kind}`}>{KIND[post.kind]}</span>}
          </h3>
          {post.cover && <Link to={`/posts/${post.id}`} tabIndex={-1} aria-hidden="true"><img className="post-cover" src={post.cover} alt={post.coverAlt || ''} loading="lazy" /></Link>}
          {post.cert && <p className="cert-strip">✔ Verified credential · <strong>{post.cert.issuer}</strong> · ID {post.cert.id}</p>}
          <p className="excerpt">{post.description || `${post.body.replace(/\n/g, ' ').slice(0, 140)}…`}</p>
        </>
      )}
      <div className="tags">
        {post.tags.map((t) => (
          <Link key={t} className="chip" to={`/search?tab=articles&q=${encodeURIComponent(t)}`}>{t}</Link>
        ))}
      </div>
      <PostActions post={post} commentsOpen={open} onToggleComments={() => setOpen((o) => !o)} />
      {open && (
        <>
          <CommentSection postId={post.id} />
          <Link className="muted" to={`/posts/${post.id}`}>Open the full conversation</Link>
        </>
      )}
    </article>
  );
}
