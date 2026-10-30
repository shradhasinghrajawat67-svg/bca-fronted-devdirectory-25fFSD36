import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useLocalStorage('ds:accounts', {});
  const [session, setSession] = useLocalStorage('ds:session', null);

  const account = session ? accounts[session] : null;
  const user = useMemo(() => (account ? { ...account.profile, id: 'me', email: session } : null), [account, session]);

  // Each returns an error message string, or null on success.
  const signup = useCallback(({ password, ...profile }) => {
    const email = profile.email.trim().toLowerCase();
    if (accounts[email]) return 'An account with this email already exists. Log in instead.';
    setAccounts((a) => ({ ...a, [email]: { password, profile: { ...profile, email } } }));
    setSession(email);
    return null;
  }, [accounts, setAccounts, setSession]);

  const login = useCallback(({ email, password }) => {
    const key = email.trim().toLowerCase();
    const a = accounts[key];
    if (!a) return 'No account found for this email. Create a profile first.';
    if (a.password !== password) return 'That password is incorrect.';
    setSession(key);
    return null;
  }, [accounts, setSession]);

  const logout = useCallback(() => setSession(null), [setSession]);

  const updateProfile = useCallback((patch) => {
    setAccounts((a) => ({ ...a, [session]: { ...a[session], profile: { ...a[session].profile, ...patch } } }));
  }, [session, setAccounts]);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), signup, login, logout, updateProfile }),
    [user, signup, login, logout, updateProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
