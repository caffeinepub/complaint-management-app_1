import { createContext, useContext, useState, useEffect, ReactNode, createElement } from 'react';

export type UserRole = 'admin' | 'user';

export interface AuthSession {
  userId: string;
  role: UserRole;
  name: string;
}

// Hardcoded credentials (no backend auth endpoint available)
const USERS: Array<{ id: string; password: string; role: UserRole; name: string }> = [
  { id: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
  { id: 'sadar_admin', password: 'sadar@2024', role: 'admin', name: 'PS Sadar Bazar Admin' },
  { id: 'user', password: 'user123', role: 'user', name: 'User' },
  { id: 'officer1', password: 'officer@1', role: 'user', name: 'Officer User' },
];

const SESSION_KEY = 'ps_sadar_session';

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  login: (id: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthSession;
        setSession(parsed);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (id: string, password: string): { success: boolean; error?: string } => {
    const user = USERS.find((u) => u.id === id && u.password === password);
    if (!user) {
      return { success: false, error: 'Invalid ID or password. Please try again.' };
    }
    const newSession: AuthSession = { userId: user.id, role: user.role, name: user.name };
    setSession(newSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return { success: true };
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return createElement(AuthContext.Provider, { value: { session, isLoading, login, logout } }, children);
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
