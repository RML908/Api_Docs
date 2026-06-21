import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '@/api/auth';
import { setAccessToken } from '@/api/axiosClient';
import type { UserProfile } from '@/types';

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from stored refresh token
  useEffect(() => {
    const refreshToken = localStorage.getItem('dst_refresh_token');
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }

    authApi
      .refresh(refreshToken)
      .then((res) => {
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        setAccessToken(accessToken);
        localStorage.setItem('dst_refresh_token', newRefresh);
        return authApi.me();
      })
      .then((res) => {
        setUser(res.data.data);
      })
      .catch(() => {
        localStorage.removeItem('dst_refresh_token');
        setAccessToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Listen for forced logout from axios interceptor
  useEffect(() => {
    const handler = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    const { accessToken, refreshToken, user: profile } = res.data.data;
    setAccessToken(accessToken);
    localStorage.setItem('dst_refresh_token', refreshToken);
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('dst_refresh_token');
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      setAccessToken(null);
      localStorage.removeItem('dst_refresh_token');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
