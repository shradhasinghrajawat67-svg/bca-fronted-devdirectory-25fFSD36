import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const id = useRef(0);

  const dismiss = useCallback((i) => setItems((l) => l.filter((t) => t.id !== i)), []);
  const toast = useCallback((message, type = 'info') => {
    const n = ++id.current;
    setItems((l) => [...l.slice(-3), { id: n, message, type }]);
    setTimeout(() => dismiss(n), 3500);
  }, [dismiss]);

  useEffect(() => {
    const onFull = () => toast('Browser storage is full, so your last change may not be saved. Remove large images and try again.', 'error');
    window.addEventListener('ds:storage-error', onFull);
    return () => window.removeEventListener('ds:storage-error', onFull);
  }, [toast]);

  const value = useMemo(() => toast, [toast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.message}</span>
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
