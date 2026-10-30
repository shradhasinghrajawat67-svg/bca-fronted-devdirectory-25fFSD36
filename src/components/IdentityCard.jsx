import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Avatar from './Avatar';
import { copyText } from '../hooks/useShare';
import { useToast } from '../context/ToastContext';

const wrap = (ctx, text, x, y, maxW, lineH, maxLines) => {
  const words = text.split(' ');
  let line = '', n = 0;
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      ctx.fillText(line, x, y); y += lineH; line = w; n += 1;
      if (n >= maxLines) return y;
    } else line = t;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineH;
};

// Draws the card onto a canvas so people can save it as an image.
async function drawCard({ profile, projects, qr }) {
  const c = document.createElement('canvas');
  c.width = 1000; c.height = 560;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 1000, 560);
  g.addColorStop(0, '#0b1d4a'); g.addColorStop(1, '#0e7490');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 560);
  ctx.fillStyle = '#fff';
  ctx.font = '700 46px system-ui, sans-serif'; ctx.fillText(profile.name, 60, 100);
  ctx.fillStyle = '#bcd0f5'; ctx.font = '400 26px system-ui, sans-serif';
  let y = wrap(ctx, profile.headline || '', 60, 148, 560, 34, 2);
  if (profile.location) { ctx.font = '400 22px system-ui, sans-serif'; ctx.fillText(profile.location, 60, y + 4); y += 44; }
  ctx.font = '600 22px system-ui, sans-serif'; ctx.fillStyle = '#fff';
  let x = 60; y += 12;
  for (const s of (profile.skills || []).slice(0, 8)) {
    const w = ctx.measureText(s).width + 32;
    if (x + w > 600) { x = 60; y += 50; }
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.roundRect(x, y, w, 38, 19); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText(s, x + 16, y + 26); x += w + 10;
  }
  if (projects.length) {
    ctx.fillStyle = '#bcd0f5'; ctx.font = '400 22px system-ui, sans-serif';
    ctx.fillText(`Projects: ${projects.slice(0, 3).join(' · ')}`.slice(0, 60), 60, 500);
  }
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(660, 90, 280, 280, 20); ctx.fill();
  if (qr) {
    const img = new Image();
    await new Promise((res) => { img.onload = res; img.onerror = res; img.src = qr; });
    ctx.drawImage(img, 674, 104, 252, 252);
  }
  ctx.fillStyle = '#fff'; ctx.font = '600 24px system-ui, sans-serif'; ctx.fillText('Scan to view my profile', 670, 415);
  ctx.fillStyle = '#bcd0f5'; ctx.font = '500 22px system-ui, sans-serif'; ctx.fillText('DevSphere', 670, 500);
  return c;
}

export default function IdentityCard({ profile, avatar, projects = [], url }) {
  const toast = useToast();
  const [qr, setQr] = useState('');
  const [qrError, setQrError] = useState('');
  const urlRef = useRef(url);
  urlRef.current = url;

  useEffect(() => {
    let off = false;
    setQrError('');
    QRCode.toDataURL(url, { errorCorrectionLevel: 'L', margin: 1, width: 360, color: { dark: '#0b1226', light: '#ffffff' } })
      .then((d) => !off && setQr(d))
      .catch(() => { if (!off) { setQr(''); setQrError('The link is too long for a QR code. Shorten your bio or skills.'); } });
    return () => { off = true; };
  }, [url]);

  const copy = async () => toast((await copyText(url)) ? 'Profile link copied.' : 'Could not copy the link.', 'success');
  const save = async () => {
    try {
      const canvas = await drawCard({ profile, projects, qr });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${profile.name.replace(/\W+/g, '-').toLowerCase()}-devsphere-card.png`;
      a.click();
    } catch {
      toast('Could not create the image on this browser.', 'error');
    }
  };
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `${profile.name} on DevSphere`, url }); return; } catch (e) { if (e?.name === 'AbortError') return; }
    }
    copy();
  };
  const isLocal = /^(localhost|127\.|192\.168\.)/.test(window.location.hostname);

  return (
    <div>
      <article className="id-card" aria-label={`Developer identity card for ${profile.name}`}>
        <div className="id-main">
          <Avatar user={{ name: profile.name, avatar }} size={72} />
          <h2>{profile.name}</h2>
          <p className="id-headline">{profile.headline}</p>
          {profile.location && <p className="id-loc">{profile.location}</p>}
          <div className="tags">{(profile.skills || []).slice(0, 8).map((s) => <span key={s} className="chip id-chip">{s}</span>)}</div>
          {projects.length > 0 && <p className="id-projects"><strong>Projects:</strong> {projects.slice(0, 3).join(', ')}</p>}
        </div>
        <div className="id-qr">
          {qr ? <img src={qr} alt={`QR code that opens ${profile.name}'s profile`} width="180" height="180" /> : <div className="id-qr-empty">{qrError || 'Creating QR code…'}</div>}
          <small>Scan to open profile</small>
        </div>
      </article>
      <div className="id-actions">
        <button className="btn btn-primary" onClick={copy}>Copy link</button>
        <button className="btn btn-outline" onClick={save} disabled={!qr}>Download as image</button>
        <button className="btn btn-ghost" onClick={share}>Share</button>
      </div>
      <p className="muted id-url"><code>{url.length > 90 ? `${url.slice(0, 90)}…` : url}</code></p>
      {isLocal && <p className="muted">You are running on localhost, so this link only opens on this computer. After you deploy the app, the link and QR code work for everyone.</p>}
    </div>
  );
}
