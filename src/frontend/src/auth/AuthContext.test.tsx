import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { clearAuthCredentials, getAuthCredentials, hasAuthCredentials } from './authCredentials';
import * as client from '../client';
import { createQueryClient } from '../queryClient';

vi.mock('../client', () => ({
  getCurrentUser: vi.fn(),
}));

const adminUser = { username: 'dev', role: 'ADMIN' as const };

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = createQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    clearAuthCredentials();
    vi.clearAllMocks();
  });

  it('login stores credentials and current user when the probe succeeds', async () => {
    vi.mocked(client.getCurrentUser).mockResolvedValue(adminUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(result.current.login('dev', 'changeme')).resolves.toBe(true);

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(result.current.user).toEqual(adminUser);
    expect(result.current.canManageStudents).toBe(true);
    expect(getAuthCredentials()).toEqual({ username: 'dev', password: 'changeme' });
  });

  it('login stores a USER without manage permission', async () => {
    vi.mocked(client.getCurrentUser).mockResolvedValue({ username: 'user', role: 'USER' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(result.current.login('user', 'user')).resolves.toBe(true);

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(result.current.user?.role).toBe('USER');
    expect(result.current.canManageStudents).toBe(false);
  });

  it('login clears credentials and stays unauthenticated on 401', async () => {
    vi.mocked(client.getCurrentUser).mockRejectedValue({
      message: 'Unauthorized',
      response: { ok: false, status: 401, statusText: 'Unauthorized', json: async () => ({}) },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(result.current.login('dev', 'wrong')).resolves.toBe(false);

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });
    expect(result.current.user).toBeNull();
    expect(hasAuthCredentials()).toBe(false);
  });

  it('logout clears credentials, user, and authentication state', async () => {
    vi.mocked(client.getCurrentUser).mockResolvedValue(adminUser);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.login('dev', 'changeme');

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    result.current.logout();

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });
    expect(result.current.user).toBeNull();
    expect(result.current.canManageStudents).toBe(false);
    expect(hasAuthCredentials()).toBe(false);
  });
});
