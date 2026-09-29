import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import {
  clearAuthCredentials,
  getAuthCredentials,
  hasAuthCredentials,
} from './authCredentials';
import * as client from '../client';
import { createQueryClient } from '../queryClient';

vi.mock('../client', () => ({
  getAllStudents: vi.fn(),
}));

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

  it('login stores credentials and marks authenticated when the probe succeeds', async () => {
    vi.mocked(client.getAllStudents).mockResolvedValue([]);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(result.current.login('dev', 'changeme')).resolves.toBe(true);

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(getAuthCredentials()).toEqual({ username: 'dev', password: 'changeme' });
  });

  it('login clears credentials and stays unauthenticated on 401', async () => {
    vi.mocked(client.getAllStudents).mockRejectedValue({
      message: 'Unauthorized',
      response: { ok: false, status: 401, statusText: 'Unauthorized', json: async () => ({}) },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(result.current.login('dev', 'wrong')).resolves.toBe(false);

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });
    expect(hasAuthCredentials()).toBe(false);
  });

  it('logout clears credentials and authentication state', async () => {
    vi.mocked(client.getAllStudents).mockResolvedValue([]);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.login('dev', 'changeme');

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    result.current.logout();

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });
    expect(hasAuthCredentials()).toBe(false);
  });
});
