import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudents } from './useStudents';
import * as client from '../client';
import * as notify from '../Notification';
import { createQueryClient } from '../queryClient';
import type { Student } from '../types/student';

vi.mock('../client');
vi.mock('../Notification');

const ada: Student = {
  id: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  gender: 'FEMALE',
};

function createWrapper() {
  const queryClient = createQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useStudents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.getAllStudents).mockResolvedValue([]);
    vi.mocked(client.addNewStudent).mockResolvedValue(undefined);
    vi.mocked(client.deleteStudent).mockResolvedValue(undefined);
  });

  it('loads students on mount', async () => {
    vi.mocked(client.getAllStudents).mockResolvedValue([ada]);

    const { result } = renderHook(() => useStudents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });
    expect(result.current.students).toEqual([ada]);
  });

  it('createStudent posts, notifies, refreshes, and returns true', async () => {
    vi.mocked(client.getAllStudents).mockResolvedValueOnce([]).mockResolvedValueOnce([ada]);

    const { result } = renderHook(() => useStudents(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    let created = false;
    await act(async () => {
      created = await result.current.createStudent({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        gender: 'FEMALE',
      });
    });

    expect(created).toBe(true);
    expect(client.addNewStudent).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      gender: 'FEMALE',
    });
    expect(notify.successNotification).toHaveBeenCalledWith(
      'Student successfully added',
      'Ada Lovelace was added to the system'
    );
    await waitFor(() => {
      expect(result.current.students).toEqual([ada]);
    });
  });

  it('createStudent notifies on failure and returns false', async () => {
    vi.mocked(client.addNewStudent).mockRejectedValue({
      response: {
        json: async () => ({
          message: 'Email taken',
          status: 400,
          error: 'Bad Request',
        }),
      },
    });

    const { result } = renderHook(() => useStudents(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    let created = true;
    await act(async () => {
      created = await result.current.createStudent({
        name: 'Ada',
        email: 'ada@example.com',
        gender: 'MALE',
      });
    });

    expect(created).toBe(false);
    expect(notify.errorNotification).toHaveBeenCalledWith(
      'There was an issue',
      'Email taken [400] [Bad Request]',
      'bottomLeft'
    );
    expect(result.current.students).toEqual([]);
  });

  it('removeStudentById deletes, notifies, and refreshes', async () => {
    vi.mocked(client.getAllStudents).mockResolvedValueOnce([ada]).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useStudents(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    await act(async () => {
      await result.current.removeStudentById(1);
    });

    expect(client.deleteStudent).toHaveBeenCalledWith(1);
    expect(notify.successNotification).toHaveBeenCalledWith(
      'Student deleted',
      'Student with 1 was deleted'
    );
    await waitFor(() => {
      expect(result.current.students).toEqual([]);
    });
  });

  it('removeStudentById notifies on failure without clearing the list', async () => {
    vi.mocked(client.getAllStudents).mockResolvedValue([ada]);
    vi.mocked(client.deleteStudent).mockRejectedValue({
      response: {
        json: async () => ({
          message: 'Not found',
          status: 404,
          error: 'Not Found',
        }),
      },
    });

    const { result } = renderHook(() => useStudents(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    await act(async () => {
      await result.current.removeStudentById(1);
    });

    expect(notify.errorNotification).toHaveBeenCalledWith(
      'There was an issue',
      'Not found [404] [Not Found]'
    );
    expect(result.current.students).toEqual([ada]);
  });
});
