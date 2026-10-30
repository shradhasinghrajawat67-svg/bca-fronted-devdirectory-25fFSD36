import { seed } from '../utils/helpers';

export const STATUSES = ['Completed', 'In progress'];

const TEMPLATES = [
  ['Team Dashboard', 'An internal dashboard that brings metrics, alerts and activity into one place.', 'Lead developer'],
  ['API Gateway', 'A small gateway that handles auth, rate limits and request logging for several services.', 'Backend developer'],
  ['Design Kit', 'A reusable component library with tokens, docs and accessibility checks.', 'Frontend developer'],
  ['Release Bot', 'A bot that drafts release notes from merged pull requests and posts them to chat.', 'Maintainer'],
];

// Demo developers get two sample projects so profiles are never empty. Links point to their real profile pages only.
export function sampleProjects(u) {
  const base = seed(u.id);
  return [0, 1].map((k) => {
    const [name, summary, role] = TEMPLATES[(base + k * 2) % TEMPLATES.length];
    const stack = [...(u.skills || [])].slice(0, 3);
    return {
      id: `s-${u.id}-${k}`, title: `${name}`, summary: `${summary} Built at ${u.company?.name || 'a previous team'}.`, role,
      stack: stack.length ? stack : ['JavaScript'], github: `https://github.com/${u.username}`, demo: '', screenshots: [],
      status: k === 0 ? 'Completed' : 'In progress', year: 2025 - k, sample: true,
    };
  });
}

// Gradient used when a project has no screenshot.
export function gradientFor(title) {
  const h = (seed(title) * 37) % 360;
  return `linear-gradient(135deg, hsl(${h} 70% 45%), hsl(${(h + 50) % 360} 75% 55%))`;
}
