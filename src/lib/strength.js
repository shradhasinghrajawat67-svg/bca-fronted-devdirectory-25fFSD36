// Profile completeness. Weights add up to 100.
export function profileStrength(p = {}, projectCount = 0) {
  const skills = (p.skills || []).length;
  const links = p.links || {};
  const hasLink = (k) => Boolean(String(links[k] || '').trim());
  const exp = (p.experience || [])[0];
  const edu = (p.education || [])[0];

  const checks = [
    { id: 'photo', label: 'Profile photo', weight: 10, ratio: p.avatar ? 1 : 0, hint: 'add a profile photo', to: '/profile/edit' },
    { id: 'headline', label: 'Headline', weight: 10, ratio: String(p.headline || '').trim().length >= 5 ? 1 : 0, hint: 'write a headline', to: '/profile/edit' },
    { id: 'bio', label: 'Bio (50+ characters)', weight: 15, ratio: Math.min(1, String(p.about || '').trim().length / 50), hint: 'write a bio of at least 50 characters', to: '/profile/edit' },
    { id: 'skills', label: 'Skills (5 or more)', weight: 15, ratio: Math.min(1, skills / 5), hint: skills ? `add ${5 - skills} more skill${5 - skills === 1 ? '' : 's'}` : 'add your skills', to: '/profile/edit' },
    { id: 'company', label: 'Role and company', weight: 10, ratio: exp && exp.title && exp.company ? 1 : exp && (exp.title || exp.company) ? 0.5 : 0, hint: 'add your current role and company', to: '/profile/edit' },
    { id: 'location', label: 'Location', weight: 5, ratio: String(p.location || '').trim() ? 1 : 0, hint: 'add your location', to: '/profile/edit' },
    { id: 'education', label: 'Education', weight: 5, ratio: edu && edu.school ? 1 : 0, hint: 'add your education', to: '/profile/edit' },
    { id: 'contact', label: 'Contact links (GitHub, LinkedIn, website)', weight: 10, ratio: Math.min(1, ['github', 'linkedin', 'website'].filter(hasLink).length / 2), hint: 'add a GitHub or LinkedIn link', to: '/profile/edit' },
    { id: 'projects', label: 'Projects (2 or more)', weight: 20, ratio: Math.min(1, projectCount / 2), hint: projectCount ? 'add one more project' : 'add two projects', to: '/projects' },
  ];
  const score = Math.round(checks.reduce((n, c) => n + c.weight * c.ratio, 0));
  const missing = checks.filter((c) => c.ratio < 1).sort((a, b) => b.weight * (1 - b.ratio) - a.weight * (1 - a.ratio));
  const next = missing.slice(0, 2);
  let message;
  if (score >= 100) message = 'Your profile is 100% complete. Nice work!';
  else message = `Your profile is ${score}% complete — ${next.map((c) => c.hint).join(' and ')} to improve it.`;
  const level = score >= 90 ? 'All-star' : score >= 70 ? 'Strong' : score >= 40 ? 'Growing' : 'Getting started';
  return { score, checks, missing, message, level };
}
