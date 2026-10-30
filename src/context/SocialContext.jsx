import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';

const SocialContext = createContext(null);

const EMPTY = {
  follows: [], likes: [], bookmarks: [], posts: [],
  comments: {},      // { [postId]: [{ id, text, date }] }
  shares: {},        // { [postId]: number } shares made by this account
  connections: {},   // { [userId]: { status: 'pending' | 'connected', at } }
  projects: [],      // this developer's showcase
  results: {},       // weekly challenge results { [weekIndex]: {...} }
  attempt: null,     // challenge in progress { week, startedAt, answers }
  roadmap: { role: '', done: [] },
  savedIdeas: [],
};
const CONNECT_DELAY = 3000; // demo developers "accept" after a few seconds

// Everything a developer does is stored per account, so two accounts in one browser never mix.
export function SocialProvider({ children }) {
  const { user } = useAuth();
  const key = user?.email || '__guest';
  const [store, setStore] = useLocalStorage('ds:store', null);

  // One-time migration from the first version of the app (single shared "ds:social" key).
  const all = useMemo(() => {
    if (store) return store;
    try {
      const old = JSON.parse(localStorage.getItem('ds:social'));
      const session = JSON.parse(localStorage.getItem('ds:session'));
      if (old && session) return { [session]: { ...EMPTY, ...old } };
    } catch { /* ignore */ }
    return {};
  }, [store]);
  const data = useMemo(() => ({ ...EMPTY, ...(all[key] || {}) }), [all, key]);

  const patch = useCallback((fn) => {
    setStore((prev) => {
      const base = prev || all;
      const cur = { ...EMPTY, ...(base[key] || {}) };
      return { ...base, [key]: { ...cur, ...fn(cur) } };
    });
  }, [setStore, key, all]);

  /* ---- likes, follows, bookmarks ---- */
  const toggle = useCallback((kind, id) => {
    const k = String(id);
    patch((s) => ({ [kind]: s[kind].includes(k) ? s[kind].filter((x) => x !== k) : [...s[kind], k] }));
  }, [patch]);
  const has = useCallback((kind, id) => data[kind].includes(String(id)), [data]);

  /* ---- posts ---- */
  const addPost = useCallback((post) => patch((s) => ({ posts: [post, ...s.posts] })), [patch]);
  const updatePost = useCallback((id, changes) => patch((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, ...changes } : p)) })), [patch]);
  const deletePost = useCallback((id) => patch((s) => {
    const { [id]: _c, ...comments } = s.comments;
    return { posts: s.posts.filter((p) => p.id !== id), comments, likes: s.likes.filter((x) => x !== id), bookmarks: s.bookmarks.filter((x) => x !== id) };
  }), [patch]);

  /* ---- comments and shares ---- */
  const addComment = useCallback((postId, text) => patch((s) => ({
    comments: { ...s.comments, [postId]: [...(s.comments[postId] || []), { id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text, date: new Date().toISOString() }] },
  })), [patch]);
  const deleteComment = useCallback((postId, cid) => patch((s) => ({
    comments: { ...s.comments, [postId]: (s.comments[postId] || []).filter((c) => c.id !== cid) },
  })), [patch]);
  const addShare = useCallback((postId) => patch((s) => ({ shares: { ...s.shares, [postId]: (s.shares[postId] || 0) + 1 } })), [patch]);

  /* ---- connections ---- */
  const connect = useCallback((id) => patch((s) => (s.connections[id] ? {} : { connections: { ...s.connections, [id]: { status: 'pending', at: Date.now() } } })), [patch]);
  const disconnect = useCallback((id) => patch((s) => {
    const { [String(id)]: _x, ...rest } = s.connections;
    return { connections: rest };
  }), [patch]);
  const connStatus = useCallback((id) => data.connections[String(id)]?.status || 'none', [data]);

  const pending = Object.values(data.connections).some((c) => c.status === 'pending');
  useEffect(() => {
    if (!pending || key === '__guest') return undefined;
    const t = setInterval(() => {
      patch((s) => {
        const now = Date.now();
        let changed = false;
        const next = Object.fromEntries(Object.entries(s.connections).map(([id, c]) => {
          if (c.status === 'pending' && now - c.at >= CONNECT_DELAY) { changed = true; return [id, { ...c, status: 'connected' }]; }
          return [id, c];
        }));
        return changed ? { connections: next } : {};
      });
    }, 1000);
    return () => clearInterval(t);
  }, [pending, patch, key]);

  /* ---- projects ---- */
  const saveProject = useCallback((project) => patch((s) => {
    const exists = s.projects.some((p) => p.id === project.id);
    return { projects: exists ? s.projects.map((p) => (p.id === project.id ? project : p)) : [project, ...s.projects] };
  }), [patch]);
  const removeProject = useCallback((id) => patch((s) => ({ projects: s.projects.filter((p) => p.id !== id) })), [patch]);

  /* ---- challenges ---- */
  const setAttempt = useCallback((attempt) => patch(() => ({ attempt })), [patch]);
  const saveResult = useCallback((week, result) => patch((s) => ({ results: { ...s.results, [week]: result }, attempt: null })), [patch]);

  /* ---- roadmap and ideas ---- */
  const setRole = useCallback((role) => patch((s) => ({ roadmap: { role, done: s.roadmap.role === role ? s.roadmap.done : [] } })), [patch]);
  const toggleStep = useCallback((id) => patch((s) => ({ roadmap: { ...s.roadmap, done: s.roadmap.done.includes(id) ? s.roadmap.done.filter((x) => x !== id) : [...s.roadmap.done, id] } })), [patch]);
  const toggleIdea = useCallback((id) => patch((s) => ({ savedIdeas: s.savedIdeas.includes(id) ? s.savedIdeas.filter((x) => x !== id) : [...s.savedIdeas, id] })), [patch]);

  const value = useMemo(() => ({
    ...data, toggle, has, addPost, updatePost, deletePost, addComment, deleteComment, addShare,
    connect, disconnect, connStatus, saveProject, removeProject, setAttempt, saveResult, setRole, toggleStep, toggleIdea,
  }), [data, toggle, has, addPost, updatePost, deletePost, addComment, deleteComment, addShare, connect, disconnect, connStatus,
    saveProject, removeProject, setAttempt, saveResult, setRole, toggleStep, toggleIdea]);

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export const useSocial = () => {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocial must be used inside <SocialProvider>');
  return ctx;
};
