import { useCallback } from 'react';
import { useToast } from '../context/ToastContext';

// Uses the native share sheet when available, otherwise copies the link.
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove();
    return ok;
  }
}

export default function useShare() {
  const toast = useToast();
  return useCallback(async ({ title, text, url }) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (e) {
        if (e?.name === 'AbortError') return false; // the person closed the share sheet
      }
    }
    const ok = await copyText(url);
    toast(ok ? 'Link copied to clipboard.' : 'Could not copy the link. Copy it from the address bar.', ok ? 'success' : 'error');
    return ok;
  }, [toast]);
}
