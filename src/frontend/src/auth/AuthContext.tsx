import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  clearAuthCredentials,
  hasAuthCredentials,
  setAuthCredentials,
  setUnauthorizedHandler,
} from './authCredentials';
import { getCurrentUser } from '../client';
import { isHttpError } from '../types/api';
import type { CurrentUser } from '../types/user';

type AuthContextValue = {
  isAuthenticated: boolean;
  user: CurrentUser | null;
  canManageStudents: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasAuthCredentials());

  const logout = () => {
    clearAuthCredentials();
    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear();
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthCredentials();
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setAuthCredentials({ username, password });
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      return true;
    } catch (error: unknown) {
      clearAuthCredentials();
      setUser(null);
      setIsAuthenticated(false);
      if (isHttpError(error) && error.response.status === 401) {
        return false;
      }
      throw error;
    }
  };

  const canManageStudents = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, canManageStudents, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}
