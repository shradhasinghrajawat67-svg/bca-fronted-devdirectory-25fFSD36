import { useEffect, useState } from 'react';

// type: 'error' | 'success'. Alerts are dismissible; errors can offer a Retry.
export default function AlertBanner({ type = 'error', message, onRetry, onDismiss }) {
  const [visible, setVisible] = useState(true);

  // A new message should show again even if the previous one was dismissed.
  useEffect(() => setVisible(true), [message]);

  if (!visible || !message) return null;

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <p>{message}</p>
      <div className="alert-actions">
        {onRetry && <button className="btn btn-outline" onClick={onRetry}>Retry</button>}
        <button className="alert-close" onClick={dismiss} aria-label="Dismiss message">×</button>
      </div>
    </div>
  );
}
