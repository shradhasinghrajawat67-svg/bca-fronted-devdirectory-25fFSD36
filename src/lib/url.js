// Accepts "github.com/me/app", "https://…" or (for GitHub) "me/app" and returns a safe https URL, or '' if invalid.
export function normUrl(value, { github = false } = {}) {
  let v = String(value || '').trim();
  if (!v) return '';
  if (github && /^[\w.-]+\/[\w.-]+$/.test(v)) v = `https://github.com/${v}`;
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.')) return '';
    return u.toString();
  } catch {
    return '';
  }
}
