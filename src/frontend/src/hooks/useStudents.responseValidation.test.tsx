import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetch from 'unfetch';
import { useStudents } from './useStudents';
import { createQueryClient } from '../queryClient';
import { studentKeys } from '../studentKeys';
import type { ApiResponse } from '../types/api';

vi.mock('unfetch', () => ({
  default: vi.fn(),
}));

vi.spyOn(console, 'error').mockImplementation(() => undefined);

const mockedFetch = vi.mocked(fetch);

describe('useStudents response validation (HTTP → Zod → Query)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    mockedFetch.mockReset();
    queryClient = createQueryClient();
  });

  function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
  }

  it('rejects an invalid HTTP payload before caching it', async () => {
    const invalidPayload = [{ id: 1, name: 'Ada' }];
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => invalidPayload,
    } as ApiResponse;
    mockedFetch.mockResolvedValue(response as never);

    const { result } = renderHook(() => useStudents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.students).toEqual([]);
    expect(queryClient.getQueryData(studentKeys.all)).toBeUndefined();
    expect(queryClient.getQueryState(studentKeys.all)?.status).toBe('error');
  });
});
