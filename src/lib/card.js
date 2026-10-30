// Public identity-card links. There is no server, so a snapshot of the card travels inside the link (#d=…).
const toB64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

export const handleOf = (u) =>
  String(u.username || (u.email || '').split('@')[0] || 'dev').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'dev';

export function encodeCard(profile, projects = []) {
  const clip = (s, n) => String(s || '').slice(0, n);
  const links = profile.links || {};
  const payload = {
    n: clip(profile.name, 40), h: clip(profile.headline, 60), l: clip(profile.location, 30), a: clip(profile.about, 80),
    s: (profile.skills || []).slice(0, 8).map((x) => clip(x, 20)),
    g: clip(links.github, 40), i: clip(links.linkedin, 40), w: clip(links.website, 50),
    p: projects.slice(0, 3).map((p) => clip(p.title, 30)),
  };
  return toB64(JSON.stringify(payload));
}

export function decodeCard(token) {
  try {
    const d = JSON.parse(fromB64(token));
    if (!d || typeof d.n !== 'string' || !d.n) return null;
    return {
      name: d.n, headline: d.h || '', location: d.l || '', about: d.a || '',
      skills: Array.isArray(d.s) ? d.s.slice(0, 8) : [],
      links: { github: d.g || '', linkedin: d.i || '', website: d.w || '' },
      projects: Array.isArray(d.p) ? d.p.slice(0, 3) : [],
    };
  } catch {
    return null;
  }
}

export function cardLink(profile, projects, origin) {
  return `${origin}/card/${handleOf(profile)}#d=${encodeCard(profile, projects)}`;
}

export const tokenFromHash = (hash) => {
  const m = /^#d=([A-Za-z0-9_-]+)$/.exec(hash || '');
  return m ? m[1] : null;
};
