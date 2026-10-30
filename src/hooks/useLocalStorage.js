import { useEffect, useState } from 'react';

export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage is full or blocked: tell the toast layer so the person knows their last change was not saved.
      window.dispatchEvent(new CustomEvent('ds:storage-error'));
    }
  }, [key, value]);
  return [value, setValue];
}
