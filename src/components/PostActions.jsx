import { useSocial } from '../context/SocialContext';
import useGuard from '../hooks/useGuard';
import useShare from '../hooks/useShare';
import { baseComments, baseLikes, baseShares, postUrl } from '../lib/engage';
import { readTime } from '../utils/helpers';

export default function PostActions({ post, commentsOpen, onToggleComments }) {
  const { has, toggle, comments, shares, addShare } = useSocial();
  const guard = useGuard();
  const share = useShare();
  const liked = has('likes', post.id);
  const saved = has('bookmarks', post.id);
  const likeCount = baseLikes(post.id) + (liked ? 1 : 0);
  const commentCount = baseComments(post.id) + (comments[post.id]?.length || 0);
  const shareCount = baseShares(post.id) + (shares[post.id] || 0);

  const doShare = guard(async () => {
    const ok = await share({ title: post.title, text: `${post.title} on DevSphere`, url: postUrl(post.id) });
    if (ok) addShare(post.id);
  }, 'share posts');

  return (
    <footer className="post-actions">
      <button className="btn btn-ghost btn-sm" aria-pressed={liked} aria-label={`Like, ${likeCount} likes`} onClick={guard(() => toggle('likes', post.id), 'like posts')}>
        {liked ? '♥' : '♡'} {likeCount}
      </button>
      <button className="btn btn-ghost btn-sm" aria-pressed={Boolean(commentsOpen)} aria-expanded={Boolean(commentsOpen)} aria-label={`Comments, ${commentCount}`} onClick={onToggleComments}>
        Comment {commentCount}
      </button>
      <button className="btn btn-ghost btn-sm" aria-label={`Share, ${shareCount} shares`} onClick={doShare}>Share {shareCount}</button>
      <button className="btn btn-ghost btn-sm" aria-pressed={saved} onClick={guard(() => toggle('bookmarks', post.id), 'save posts')}>{saved ? 'Saved' : 'Save'}</button>
      <span className="muted">{readTime(post.body)} min read</span>
    </footer>
  );
}
