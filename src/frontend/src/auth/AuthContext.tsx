import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  clearAuthCredentials,
  hasAuthCredentials,
  setAuthCredentials,
  setUnauthorizedHandler,
} from './authCredentials';
import { getAllStudents } from '../client';
import { isHttpError } from '../types/api';

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasAuthCredentials());

  const logout = useCallback(() => {
    clearAuthCredentials();
    setIsAuthenticated(false);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthCredentials();
      setIsAuthenticated(false);
      queryClient.clear();
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setAuthCredentials({ username, password });
      try {
        await getAllStudents();
        setIsAuthenticated(true);
        return true;
      } catch (error: unknown) {
        clearAuthCredentials();
        setIsAuthenticated(false);
        if (isHttpError(error) && error.response.status === 401) {
          return false;
        }
        throw error;
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
    }),
    [isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}
