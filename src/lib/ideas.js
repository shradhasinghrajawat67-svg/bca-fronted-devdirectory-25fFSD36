import { IDEAS } from '../data/ideas';
import { LEVELS } from '../data/ideas';
import { normSkill } from '../data/roles';

// Recommendation rules:
//  +3 per matching skill, +2 per matching interest,
//  +5 for the chosen level, -4 for one level away, -8 for two levels away.
// A project is kept only if it matches at least one skill or interest (or nothing was chosen).
export function recommend({ skills = [], interests = [], level = 'Beginner' }, ideas = IDEAS) {
  const have = new Set(skills.map(normSkill));
  const want = new Set(interests);
  const nothingChosen = !have.size && !want.size;
  const out = ideas.map((idea) => {
    const matchedSkills = idea.skills.filter((s) => have.has(normSkill(s)));
    const matchedInterests = idea.interests.filter((i) => want.has(i));
    const distance = Math.abs(LEVELS.indexOf(idea.level) - LEVELS.indexOf(level));
    const levelScore = distance === 0 ? 5 : distance === 1 ? -4 : -8;
    const score = matchedSkills.length * 3 + matchedInterests.length * 2 + levelScore;
    const best = Math.min(idea.skills.length, Math.max(have.size, 1)) * 3 + Math.min(idea.interests.length, Math.max(want.size, 1)) * 2 + 5;
    return {
      ...idea, matchedSkills, matchedInterests, score,
      match: Math.max(0, Math.min(100, Math.round((score / best) * 100))),
      toLearn: idea.skills.filter((s) => !have.has(normSkill(s))),
      levelFit: distance === 0 ? 'exact' : distance === 1 ? 'near' : 'far',
    };
  });
  return out
    .filter((i) => nothingChosen ? i.levelFit === 'exact' : i.matchedSkills.length + i.matchedInterests.length > 0)
    .sort((a, b) => b.score - a.score || a.hours - b.hours);
}
