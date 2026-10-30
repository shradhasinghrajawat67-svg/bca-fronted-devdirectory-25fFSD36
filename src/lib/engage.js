import { seed } from '../utils/helpers';

// Sample posts from the public API start with some activity; posts written in DevSphere start at zero.
const isLocal = (id) => String(id).startsWith('l-');
export const baseLikes = (id) => (isLocal(id) ? 0 : (seed(id) * 7) % 40);
export const baseShares = (id) => (isLocal(id) ? 0 : seed(id) % 9);
export const baseComments = (id) => (isLocal(id) ? 0 : 5); // the API returns five comments per post
export const postUrl = (id) => `${window.location.origin}/posts/${id}`;
