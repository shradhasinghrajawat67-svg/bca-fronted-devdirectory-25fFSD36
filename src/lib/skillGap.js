import { ROLES, normSkill, stepsFor } from '../data/roles';

// Compare a developer's skills with a role. Core skills weigh 2, bonus skills weigh 1.
export function analyzeGap(roleName, userSkills = []) {
  const role = ROLES[roleName];
  if (!role) return null;
  const have = new Set(userSkills.map(normSkill));
  const split = (list) => ({
    matched: list.filter((s) => have.has(normSkill(s))),
    missing: list.filter((s) => !have.has(normSkill(s))),
  });
  const core = split(role.core);
  const bonus = split(role.bonus);
  const total = role.core.length * 2 + role.bonus.length;
  const earned = core.matched.length * 2 + bonus.matched.length;
  return { role: roleName, core, bonus, percent: Math.round((earned / total) * 100), total, earned };
}

// Roadmap: missing core skills first, then missing bonus skills.
export function buildRoadmap(gap) {
  if (!gap) return [];
  return [
    ...gap.core.missing.map((skill) => ({ skill, priority: 'Core' })),
    ...gap.bonus.missing.map((skill) => ({ skill, priority: 'Bonus' })),
  ].map((item, i) => ({
    ...item,
    order: i + 1,
    steps: stepsFor(item.skill).map((text, j) => ({ id: `${item.skill}:${j}`, text })),
  }));
}

// Progress through the roadmap steps that the user has ticked off.
export function roadmapProgress(roadmap, done = []) {
  const all = roadmap.flatMap((r) => r.steps.map((s) => s.id));
  const finished = all.filter((id) => done.includes(id)).length;
  return { finished, total: all.length, percent: all.length ? Math.round((finished / all.length) * 100) : 100 };
}

export const estimateWeeks = (roadmap, done = []) =>
  roadmap.reduce((n, r) => n + r.steps.filter((s) => !done.includes(s.id)).length, 0);
