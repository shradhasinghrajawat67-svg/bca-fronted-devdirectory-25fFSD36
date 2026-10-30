import { useEffect, useMemo, useState } from 'react';
import { getAllPosts, getUsers, errorMessage } from '../services/postService';
import { enrichUser, meAsUser, normalizePost } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';

let cache = null; // one shared request for users + posts

export default function useCommunity() {
  const { user } = useAuth();
  const { posts: mine } = useSocial();
  const [state, setState] = useState({ loading: true });
  const [n, setN] = useState(0);

  useEffect(() => {
    let off = false;
    setState({ loading: true });
    (cache ||= Promise.all([getUsers(), getAllPosts()]))
      .then(([u, p]) => !off && setState({ loading: false, users: u.map(enrichUser), posts: p.map(normalizePost) }))
      .catch((e) => {
        cache = null;
        if (!off) setState({ loading: false, error: errorMessage(e) });
      });
    return () => { off = true; };
  }, [n]);

  const users = useMemo(
    () => (state.users ? (user ? [meAsUser(user), ...state.users] : state.users) : []),
    [state.users, user]
  );
  const posts = useMemo(
    () => (state.posts ? [...(user ? mine.filter((p) => p.status !== 'draft') : []), ...state.posts] : []),
    [state.posts, mine, user]
  );
  const byId = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);

  return { loading: state.loading, error: state.error, users, posts, byId, retry: () => { cache = null; setN((x) => x + 1); } };
}
