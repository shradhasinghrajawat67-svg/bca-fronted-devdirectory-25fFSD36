// Generates crisp SVG artwork (certificates, achievement cards, project screenshots, code cards)
// as data URIs, so posts can carry images without any network request.
const uri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const TONES = {
  blue: ['#1d4ed8', '#22d3ee'], violet: ['#6d28d9', '#f472b6'], green: ['#047857', '#a3e635'],
  amber: ['#b45309', '#fde047'], rose: ['#be123c', '#fb923c'], slate: ['#0f172a', '#38bdf8'],
};
const tone = (t) => TONES[t] || TONES.blue;

function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const hash = (str) => [...String(str)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

function wrap(text, max, maxLines = 3) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  words.forEach((w) => {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  });
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}
const grad = (id, [a, b], x2 = 1, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

/* ---------- certificate ---------- */
export function certificateArt({ title, issuer, name, date, credentialId, tone: t = 'blue' }) {
  const c = tone(t);
  const lines = wrap(title, 34, 2);
  const y0 = 312;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" font-family="Georgia, 'Times New Roman', serif">
<defs>${grad('g', c)}${grad('s', c, 0, 1)}</defs>
<rect width="1200" height="630" fill="#fbf8f1"/>
<rect x="28" y="28" width="1144" height="574" rx="10" fill="none" stroke="url(#g)" stroke-width="6"/>
<rect x="46" y="46" width="1108" height="538" rx="6" fill="none" stroke="${c[0]}" stroke-opacity=".35" stroke-width="1.5"/>
<rect x="28" y="28" width="1144" height="14" fill="url(#g)" opacity=".9"/>
<text x="600" y="118" text-anchor="middle" font-size="22" letter-spacing="9" fill="${c[0]}" font-family="Arial, sans-serif" font-weight="700">CERTIFICATE OF ACHIEVEMENT</text>
<text x="600" y="172" text-anchor="middle" font-size="22" fill="#6b7280" font-style="italic">This is to certify that</text>
<text x="600" y="248" text-anchor="middle" font-size="48" fill="#111827" font-weight="700">${esc(name)}</text>
${lines.map((l, i) => `<text x="600" y="${y0 + i * 52}" text-anchor="middle" font-size="40" fill="${c[0]}" font-weight="700">${esc(l)}</text>`).join('')}
<text x="600" y="${y0 + 30 + lines.length * 46}" text-anchor="middle" font-size="22" fill="#4b5563" font-style="italic">awarded by ${esc(issuer)}</text>
<line x1="150" y1="500" x2="420" y2="500" stroke="#9ca3af"/><text x="285" y="528" text-anchor="middle" font-size="16" fill="#6b7280" font-family="Arial, sans-serif">${esc(date)}</text>
<line x1="780" y1="500" x2="1050" y2="500" stroke="#9ca3af"/><text x="915" y="528" text-anchor="middle" font-size="16" fill="#6b7280" font-family="Arial, sans-serif">ID ${esc(credentialId)}</text>
<g transform="translate(600 505)"><circle r="52" fill="url(#s)"/><circle r="42" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-dasharray="3 4"/>
<path d="M-18 2 l12 13 l26 -30" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>
</svg>`;
  return uri(svg);
}

/* ---------- achievement / milestone ---------- */
export function achievementArt({ title, subtitle = '', stat = '', tone: t = 'violet' }) {
  const c = tone(t);
  const r = rng(hash(title));
  const dots = Array.from({ length: 46 }, () => {
    const x = 40 + r() * 1120; const y = 30 + r() * 570; const s = 3 + r() * 9; const o = 0.15 + r() * 0.5;
    return r() > 0.5 ? `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(1)}" fill="#fff" opacity="${o.toFixed(2)}"/>`
      : `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(s * 1.6).toFixed(1)}" height="${(s * 0.7).toFixed(1)}" rx="2" fill="${c[1]}" opacity="${o.toFixed(2)}" transform="rotate(${(r() * 90).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }).join('');
  const star = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2; const rad = i % 2 ? 34 : 78;
    return `${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`;
  }).join(' ');
  const lines = wrap(title, 19);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" font-family="Arial, Helvetica, sans-serif">
<defs>${grad('g', c)}<radialGradient id="glow"><stop offset="0" stop-color="${c[1]}" stop-opacity=".55"/><stop offset="1" stop-color="${c[1]}" stop-opacity="0"/></radialGradient></defs>
<rect width="1200" height="630" fill="#0b1020"/><rect width="1200" height="630" fill="url(#g)" opacity=".5"/>
<circle cx="300" cy="315" r="270" fill="url(#glow)"/>${dots}
<g transform="translate(300 315)"><circle r="170" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/><circle r="140" fill="#0b1020" stroke="url(#g)" stroke-width="10"/>
<polygon points="${star}" fill="url(#g)" stroke="#fff" stroke-opacity=".8" stroke-width="3" stroke-linejoin="round"/></g>
<text x="560" y="${240 - (lines.length - 1) * 24}" font-size="20" letter-spacing="6" font-weight="700" fill="${c[1]}">ACHIEVEMENT UNLOCKED</text>
${lines.map((l, i) => `<text x="560" y="${300 - (lines.length - 1) * 24 + i * 56}" font-size="46" font-weight="800" fill="#fff">${esc(l)}</text>`).join('')}
<text x="560" y="${350 + (lines.length - 1) * 30}" font-size="24" fill="#cbd5e1">${esc(subtitle)}</text>
${stat ? `<rect x="560" y="${380 + (lines.length - 1) * 30}" width="${60 + stat.length * 14}" height="52" rx="26" fill="#fff" fill-opacity=".14" stroke="#fff" stroke-opacity=".4"/><text x="${590}" y="${414 + (lines.length - 1) * 30}" font-size="24" font-weight="700" fill="#fff">${esc(stat)}</text>` : ''}
</svg>`;
  return uri(svg);
}

/* ---------- project screenshot (browser mockup with live-looking charts) ---------- */
export function dashboardArt({ title, tone: t = 'slate', url = 'app.devsphere.dev' }) {
  const c = tone(t);
  const r = rng(hash(title));
  const bars = Array.from({ length: 12 }, (_, i) => {
    const h = 40 + r() * 140;
    return `<rect x="${112 + i * 36}" y="${530 - h}" width="22" height="${h.toFixed(0)}" rx="5" fill="url(#g)" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
  }).join('');
  let d = ''; const pts = [];
  for (let i = 0; i < 10; i++) { pts.push([622 + i * 54, 515 - (30 + r() * 90) - i * 8]); }
  d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1].toFixed(0)}`).join(' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" font-family="Arial, Helvetica, sans-serif">
<defs>${grad('g', c, 0, 1)}<linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[1]}" stop-opacity=".45"/><stop offset="1" stop-color="${c[1]}" stop-opacity="0"/></linearGradient></defs>
<rect width="1200" height="630" fill="${c[0]}"/><rect width="1200" height="630" fill="${c[1]}" opacity=".22"/>
<rect x="60" y="50" width="1080" height="540" rx="18" fill="#0f172a" stroke="#fff" stroke-opacity=".2"/>
<rect x="60" y="50" width="1080" height="46" rx="18" fill="#1e293b"/><circle cx="92" cy="73" r="7" fill="#f87171"/><circle cx="116" cy="73" r="7" fill="#fbbf24"/><circle cx="140" cy="73" r="7" fill="#4ade80"/>
<rect x="400" y="59" width="400" height="28" rx="14" fill="#0f172a"/><text x="600" y="78" text-anchor="middle" font-size="14" fill="#94a3b8">${esc(url)}</text>
<text x="92" y="140" font-size="26" font-weight="700" fill="#f8fafc">${esc(title)}</text>
${[0, 1, 2].map((i) => `<rect x="${92 + i * 340}" y="160" width="310" height="90" rx="12" fill="#1e293b"/><text x="${112 + i * 340}" y="195" font-size="14" fill="#94a3b8">${['Requests / min', 'Success rate', 'p95 latency'][i]}</text><text x="${112 + i * 340}" y="232" font-size="30" font-weight="700" fill="#fff">${['12.4k', '99.97%', '84 ms'][i]}</text>`).join('')}
<rect x="92" y="280" width="470" height="270" rx="12" fill="#1e293b"/>${bars}
<rect x="592" y="280" width="520" height="270" rx="12" fill="#1e293b"/>
<path d="${d} L${pts[pts.length - 1][0]} 535 L${pts[0][0]} 535 Z" fill="url(#a)"/><path d="${d}" fill="none" stroke="${c[1]}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  return uri(svg);
}

/* ---------- code card ---------- */
export function codeArt({ title, lines, tone: t = 'violet' }) {
  const c = tone(t);
  const colors = ['#f472b6', '#7dd3fc', '#fde68a', '#a7f3d0', '#e2e8f0'];
  const r = rng(hash(title));
  const body = lines.map((l, i) => {
    const parts = l.split(/(\s+)/);
    let x = 120; const t0 = parts.map((p) => {
      const col = /^\s+$/.test(p) ? '#fff' : colors[Math.floor(r() * colors.length)];
      const out = `<tspan fill="${col}" xml:space="preserve">${esc(p)}</tspan>`; x += p.length * 14; return out;
    }).join('');
    return `<text x="120" y="${190 + i * 44}" font-size="24" font-family="'Courier New', monospace"><tspan fill="#475569">${String(i + 1).padStart(2, ' ')}  </tspan>${t0}</text>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
<defs>${grad('g', c)}</defs><rect width="1200" height="630" fill="url(#g)"/>
<rect x="70" y="60" width="1060" height="510" rx="20" fill="#0b1020" opacity=".96"/>
<circle cx="110" cy="96" r="8" fill="#f87171"/><circle cx="136" cy="96" r="8" fill="#fbbf24"/><circle cx="162" cy="96" r="8" fill="#4ade80"/>
<text x="600" y="102" text-anchor="middle" font-size="18" fill="#94a3b8" font-family="Arial, sans-serif">${esc(title)}</text>${body}
</svg>`;
  return uri(svg);
}

/* ---------- metric / growth card ---------- */
export function metricArt({ title, value, label, tone: t = 'green' }) {
  const c = tone(t);
  const r = rng(hash(title));
  const pts = Array.from({ length: 14 }, (_, i) => [90 + i * 78, 470 - i * 14 - r() * 90]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1].toFixed(0)}`).join(' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" font-family="Arial, Helvetica, sans-serif">
<defs>${grad('g', c)}<linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[1]}" stop-opacity=".5"/><stop offset="1" stop-color="${c[1]}" stop-opacity="0"/></linearGradient></defs>
<rect width="1200" height="630" fill="#0b1020"/><rect width="1200" height="630" fill="url(#g)" opacity=".35"/>
<text x="80" y="110" font-size="26" fill="#cbd5e1" font-weight="600">${esc(title)}</text>
<text x="80" y="220" font-size="104" font-weight="800" fill="#fff">${esc(value)}</text>
<text x="80" y="266" font-size="26" fill="${c[1]}" font-weight="700">${esc(label)}</text>
<path d="${d} L${pts[13][0]} 560 L${pts[0][0]} 560 Z" fill="url(#a)"/><path d="${d}" fill="none" stroke="${c[1]}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="${pts[13][0]}" cy="${pts[13][1].toFixed(0)}" r="11" fill="#fff"/>
</svg>`;
  return uri(svg);
}
