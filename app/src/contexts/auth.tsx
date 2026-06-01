'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Account } from '@/types';
import { authenticateUser, getCurrentUser, logoutUser, registerUser } from '@/lib/auth';

interface AuthContextValue {
  user: Account | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Account>;
  register: (email: string, password: string) => Promise<Account>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const current = await getCurrentUser();
        setUser(current);
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const authenticated = await authenticateUser(email, password);
    setUser(authenticated);
    return authenticated;
  };

  const register = async (email: string, password: string) => {
    const newUser = await registerUser(email, password);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    logoutUser();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
