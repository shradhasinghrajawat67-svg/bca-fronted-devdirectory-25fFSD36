import apiClient from './api';
import { FEED, commentsFor } from '../data/feed';

// GET /users
export const getUsers = () => apiClient.get('/users').then((r) => r.data);

// GET /users/:id
export const getUserById = (id) => apiClient.get(`/users/${id}`).then((r) => r.data);

// Posts and comments are written in English and bundled with the app (see data/feed.js).
// Developers still come from the public API.
const notFound = () => Promise.reject({ response: { status: 404 } });
export const getPostsByUser = (id) => Promise.resolve(FEED.filter((p) => p.userId === String(id)));
export const getAllPosts = () => Promise.resolve(FEED);

// POST /posts — returns the full response so callers can check for 201
export const createPost = ({ title, body, userId }) =>
  apiClient.post('/posts', { title, body, userId });

// Turns an Axios error into a message a person can act on
export const errorMessage = (err) => {
  if (err.code === 'ECONNABORTED') return 'The request timed out after 8 seconds.';
  if (err.response) {
    const s = err.response.status;
    if (s === 404) return 'That record does not exist (404).';
    return `The server responded with an error (${s}).`;
  }
  return 'Could not reach the server. Check your connection.';
};

// GET /posts/:id and /posts/:id/comments (article page)
export const getPostById = (id) => {
  const post = FEED.find((p) => p.id === String(id));
  return post ? Promise.resolve(post) : notFound();
};
export const getComments = (id) => Promise.resolve(commentsFor(id));
