export const SKILLS = ['React', 'TypeScript', 'Node.js', 'CSS', 'Python', 'DevOps', 'GraphQL', 'Testing', 'Design Systems', 'AI/ML', 'Rust', 'SQL'];
export const TOPICS = ['React', 'CSS', 'TypeScript', 'Node.js', 'DevOps', 'AI', 'Testing', 'Career'];
const ROLES = ['Frontend Engineer', 'Backend Engineer', 'Full-stack Developer', 'DevOps Engineer', 'Engineering Manager', 'Data Engineer', 'UI Engineer', 'Mobile Developer'];

export const seed = (s) => [...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0);
export const avatarFor = (email) => `https://i.pravatar.cc/200?u=${encodeURIComponent(email)}`;
export const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
export const readTime = (body) => Math.max(1, Math.round(body.split(/\s+/).length / 200));
export const linkUrl = (kind, v) =>
  /^https?:/.test(v) ? v : kind === 'github' ? `https://github.com/${v}` : kind === 'linkedin' ? `https://linkedin.com/in/${v}` : `https://${v}`;

// JSONPlaceholder users have no profile fields, so we derive stable ones from the id.
export const enrichUser = (u) => {
  const role = ROLES[u.id % ROLES.length];
  return {
    ...u,
    id: String(u.id),
    avatar: avatarFor(u.email),
    headline: `${role} at ${u.company.name}`,
    location: u.address.city,
    about: `Currently working to ${u.company.bs}. ${u.company.catchPhrase}.`,
    skills: [0, 3, 5].map((i) => SKILLS[(u.id + i) % SKILLS.length]),
    experience: [{ title: role, company: u.company.name, years: `${2019 + (u.id % 4)} – Present` }],
    education: [{ school: `${u.address.city} Institute of Technology`, degree: 'B.Sc. Computer Science', years: '' }],
    links: { github: u.username, website: u.website },
  };
};

export const meAsUser = (u) => ({
  ...u,
  id: 'me',
  avatar: u.avatar || avatarFor(u.email),
  username: u.email.split('@')[0],
  company: { name: u.experience?.[0]?.company || 'Independent' },
  skills: u.skills || [],
});

export const normalizePost = (p) => {
  if (p.tags && p.kind) return { ...p, id: String(p.id), userId: String(p.userId) }; // bundled English feed
  const a = TOPICS[p.id % TOPICS.length];
  const b = TOPICS[(p.id * 3 + 1) % TOPICS.length];
  return {
    id: String(p.id),
    userId: String(p.userId),
    title: p.title,
    body: p.body,
    tags: [...new Set([a, b])],
    date: new Date(Date.UTC(2026, 9, 21) - (100 - p.id) * 0.6 * 86400000).toISOString(),
    status: 'published',
  };
};

// ---- tiny, safe markdown renderer (escapes HTML first) ----
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

export function mdToHtml(md) {
  let out = '';
  let list = false;
  for (const line of md.split('\n')) {
    const li = line.match(/^[-*] (.*)/);
    if (li) {
      if (!list) { out += '<ul>'; list = true; }
      out += `<li>${inline(li[1])}</li>`;
      continue;
    }
    if (list) { out += '</ul>'; list = false; }
    const h = line.match(/^(#{1,3}) (.*)/);
    if (h) out += `<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`;
    else if (line.trim()) out += `<p>${inline(line)}</p>`;
  }
  return list ? out + '</ul>' : out;
}
