import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// guard(action, 'like posts') runs the action for signed-in people and sends everyone else to the login page.
export default function useGuard() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  return useCallback((action, what = 'do that') => (...args) => {
    if (isAuthenticated) return action(...args);
    toast(`Log in to ${what}.`, 'info');
    navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } } });
    return undefined;
  }, [isAuthenticated, navigate, location, toast]);
}
