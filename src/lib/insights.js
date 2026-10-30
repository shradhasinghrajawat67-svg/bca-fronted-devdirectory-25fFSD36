import { normSkill } from '../data/roles';
import { seed } from '../utils/helpers';

export const CATS = {
  Frontend: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Next.js', 'Accessibility', 'Responsive Design', 'Design Systems'],
  Backend: ['Node.js', 'SQL', 'REST APIs', 'Databases', 'GraphQL', 'Authentication', 'Redis', 'Python'],
  'DevOps & Cloud': ['Docker', 'CI/CD', 'Linux', 'Cloud (AWS)', 'Kubernetes', 'Terraform', 'Monitoring', 'Networking', 'Security'],
  'Data & AI': ['Python', 'SQL', 'AI/ML', 'Statistics', 'Pandas', 'Machine Learning'],
  Quality: ['Testing', 'Accessibility', 'Security', 'Monitoring'],
  Tooling: ['Git', 'Linux', 'CI/CD', 'Docker'],
};

// Rough, illustrative demand index per skill (0-100) used for the market view.
export const DEMAND = {
  JavaScript: 94, 'AI/ML': 91, TypeScript: 90, 'Cloud (AWS)': 89, Python: 88, React: 86, 'Node.js': 85, SQL: 84,
  Docker: 82, Kubernetes: 80, 'CI/CD': 78, Git: 75, CSS: 72, Testing: 70, GraphQL: 62, Rust: 58,
};

const rng = (s) => { let x = (s >>> 0) || 1; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; };
const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));

export function radarAxes(skills = []) {
  const have = new Set(skills.map(normSkill));
  return Object.entries(CATS).map(([label, list]) => {
    const hits = list.filter((s) => have.has(normSkill(s))).length;
    return { label, hits, value: clamp(hits ? 28 + hits * 24 : 8) };
  });
}

export function activityGrid(key, boost = 0) {
  const r = rng(seed(key) + 11);
  return Array.from({ length: 13 }, (_, w) => Array.from({ length: 7 }, (_, d) => {
    const p = r() + boost * 0.04 + w * 0.012 - (d >= 5 ? 0.25 : 0);
    return p > 1.05 ? 4 : p > 0.85 ? 3 : p > 0.62 ? 2 : p > 0.4 ? 1 : 0;
  }));
}

export function growthSeries(key, skills = [], projects = 0, posts = 0) {
  const r = rng(seed(key) + 3);
  const base = 30 + skills.length * 4 + projects * 6 + posts * 3;
  return Array.from({ length: 8 }, (_, i) => Math.round(clamp(base + i * 5 + (r() - 0.35) * 9, 5, 99)));
}

export function matchScore(mine = [], other = []) {
  const a = new Set(mine.map(normSkill));
  const shared = other.filter((s) => a.has(normSkill(s)));
  const learn = other.filter((s) => !a.has(normSkill(s)));
  const pct = clamp(Math.round(42 + shared.length * 16 + learn.length * 7), 35, 98);
  const reason = shared.length
    ? `You both work with ${shared.slice(0, 2).join(' and ')}${learn.length ? `, and they could teach you ${learn[0]}` : ''}.`
    : learn.length ? `Complements you: they know ${learn.slice(0, 2).join(' and ')}.` : 'Active in your network.';
  return { pct, shared, learn, reason };
}
