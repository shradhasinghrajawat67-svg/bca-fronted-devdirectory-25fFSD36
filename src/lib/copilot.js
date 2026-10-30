import { ROLES } from '../data/roles';
import { analyzeGap, buildRoadmap, estimateWeeks } from './skillGap';
import { recommend } from './ideas';
import { profileStrength } from './strength';
import { DEMAND } from './insights';

export const SUGGESTIONS = [
  'What should I learn next?',
  'Suggest a project for me',
  'How can I improve my profile?',
  'Help me prepare for an interview',
  'Write a headline and bio for me',
  'Which of my skills are in demand?',
];

const levelFor = (n) => (n < 4 ? 'Beginner' : n < 8 ? 'Intermediate' : 'Advanced');
const list = (a) => a.map((x) => `- ${x}`).join('\n');
const pickRole = (q, fallback) => {
  const hit = Object.keys(ROLES).find((r) => q.includes(r.split(' ')[0].toLowerCase().replace('-', '')) || q.includes(r.toLowerCase()));
  return hit || fallback || 'Full-Stack Developer';
};

// A small on-device assistant: it reads the developer's real profile data and writes an answer.
// No data leaves the browser and no external AI service is called.
export function reply(question, ctx) {
  const q = question.toLowerCase().replace(/[^a-z0-9+/#.\s-]/g, ' ');
  const skills = ctx.skills;
  const confidence = Math.min(97, 64 + skills.length * 4 + ctx.projectCount * 3);
  const role = pickRole(q.replace('full-stack', 'fullstack'), ctx.role);
  const out = (steps, text, chips = []) => ({ steps, text, chips, confidence });

  if (/^(hi|hello|hey|start)\b/.test(q) || q === 'hello') {
    return out(['Loading your profile', 'Reading your skills'],
      `Hi ${ctx.name}! I'm your **DevSphere Copilot**. I can see ${skills.length ? `${skills.length} skills` : 'a fresh profile'}${ctx.projectCount ? ` and ${ctx.projectCount} project${ctx.projectCount > 1 ? 's' : ''}` : ''} on your account.\n\nAsk me about your next skills, project ideas, profile improvements, interviews or your bio.`,
      SUGGESTIONS.slice(0, 4));
  }

  if (/learn|next|gap|missing|roadmap|skill|study/.test(q) && !/demand|market/.test(q)) {
    const gap = analyzeGap(role, skills);
    const road = buildRoadmap(gap);
    const top = road.slice(0, 3);
    return out(['Reading your skills', `Comparing with ${role}`, 'Weighting core vs bonus skills', 'Building a learning order'],
      `For **${role}** you currently match **${gap.percent}%** of the expected skills.\n\n## Learn these next\n${list(top.map((r) => `**${r.skill}** (${r.priority.toLowerCase()} skill)`)) || '- You already cover every skill for this role!'}\n\nAt one step per week, the full roadmap would take about **${estimateWeeks(road)} weeks**. Start with ${top[0] ? top[0].skill : 'a stretch project'} because core skills count double in the score.`,
      ['Suggest a project for me', 'Which of my skills are in demand?']);
  }

  if (/project|idea|build|portfolio/.test(q)) {
    const ideas = recommend({ skills, interests: [], level: levelFor(skills.length) }).slice(0, 3);
    if (!ideas.length) return out(['Scanning project ideas'], 'I could not find a close match yet. Add a few skills to your profile and ask again.', ['How can I improve my profile?']);
    return out(['Reading your skills', 'Scoring 20+ project ideas', 'Checking difficulty fit', 'Ranking the best matches'],
      `Here are my top picks for a **${levelFor(skills.length).toLowerCase()}** developer:\n\n${list(ideas.map((i) => `**${i.title}** (${i.match}% match, about ${i.hours}h) – ${i.summary}`))}\n\nPick **${ideas[0].title}**: it uses ${ideas[0].matchedSkills.slice(0, 3).join(', ') || 'your existing skills'}${ideas[0].toLearn.length ? ` and teaches you ${ideas[0].toLearn.slice(0, 2).join(' and ')}` : ''}.`,
      ['What should I learn next?']);
  }

  if (/profile|strength|improve|complete|visib/.test(q)) {
    const s = profileStrength(ctx.profile, ctx.projectCount);
    const todo = s.missing.slice(0, 3);
    return out(['Auditing 9 profile sections', 'Weighting each section', 'Finding the quickest wins'],
      `Your profile strength is **${s.score}/100** (${s.level}).\n\n${todo.length ? `## Quick wins\n${list(todo.map((c) => `${c.hint} (worth up to ${c.weight} points)`))}` : 'Everything is complete. Nice work!'}\n\nProfiles with two or more projects and a clear headline get noticed far more often.`,
      ['Write a headline and bio for me', 'Suggest a project for me']);
  }

  if (/interview|prepare|question|hire/.test(q)) {
    const focus = (skills.length ? skills : ['JavaScript', 'Git', 'Problem solving']).slice(0, 3);
    return out(['Picking your strongest skills', 'Drafting likely questions', 'Adding a study plan'],
      `Here is a focused prep plan for **${role}** interviews.\n\n## Likely technical topics\n${list(focus.map((s) => `${s}: explain a real problem you solved and the trade-offs you made`))}\n\n## Behavioural\n- Tell me about a disagreement in code review\n- Describe a bug that took you a long time to find\n\n## Study plan\n- Day 1-2: revisit fundamentals of ${focus[0]}\n- Day 3: build a tiny project that uses ${focus[1] || focus[0]}\n- Day 4: practise out loud with a friend\n- Day 5: take the weekly DevSphere challenge`,
      ['What should I learn next?']);
  }

  if (/bio|headline|summary|resume|cv|about/.test(q)) {
    const top = skills.slice(0, 3);
    const head = `${ctx.role ? ctx.role.replace(' Developer', '') : 'Software'} developer${top.length ? ` · ${top.join(' · ')}` : ''}`;
    return out(['Reading your skills and experience', 'Choosing a confident tone', 'Drafting a headline', 'Drafting a bio'],
      `## Headline\n${head}\n\n## Bio\nI build reliable, user-friendly software${top.length ? ` with ${top.join(', ')}` : ''}. I enjoy turning unclear ideas into small, shipped projects and I share what I learn along the way. Currently looking for ${ctx.projectCount ? 'new challenges' : 'my first showcase project'} and people to learn with.\n\nEdit anything you like in **Profile → Edit**.`,
      ['How can I improve my profile?']);
  }

  if (/demand|market|trend|salary|worth|valuable/.test(q)) {
    const rows = skills.map((s) => [s, DEMAND[s]]).filter((r) => r[1]).sort((a, b) => b[1] - a[1]);
    const best = Object.entries(DEMAND).filter(([s]) => !skills.includes(s)).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return out(['Reading your skills', 'Matching against the demand index', 'Finding high-value gaps'],
      `${rows.length ? `## Your most in-demand skills\n${list(rows.slice(0, 3).map(([s, v]) => `**${s}** – demand index ${v}/100`))}\n\n` : ''}## High-value skills you could add\n${list(best.map(([s, v]) => `**${s}** – demand index ${v}/100`))}\n\nThe index is a simple illustrative score from the DevSphere dataset, not live market data.`,
      ['What should I learn next?']);
  }

  return out(['Understanding your question', 'Checking what I can help with'],
    `I am best at questions about **your growth as a developer**. Try one of these:\n\n${list(SUGGESTIONS)}`, SUGGESTIONS.slice(0, 3));
}
