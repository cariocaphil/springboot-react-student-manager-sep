import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCourses } from './useCourses';
import * as client from '../client';
import i18n from '../i18n';
import * as notify from '../Notification';
import { createQueryClient } from '../queryClient';
import type { Course } from '../types/course';

vi.mock('../client');
vi.mock('../Notification');

const algebra: Course = {
  id: 1,
  title: 'Algebra',
  description: 'Intro algebra',
  capacity: 30,
};

function createWrapper() {
  const queryClient = createQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.getAllCourses).mockResolvedValue([]);
    vi.mocked(client.addNewCourse).mockResolvedValue(undefined);
    vi.mocked(client.updateCourse).mockResolvedValue(undefined);
    vi.mocked(client.deleteCourse).mockResolvedValue(undefined);
  });

  it('loads courses on mount', async () => {
    vi.mocked(client.getAllCourses).mockResolvedValue([algebra]);

    const { result } = renderHook(() => useCourses(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.courses).toEqual([algebra]);
    expect(result.current.isError).toBe(false);
  });

  it('exposes list error state without clearing retryLoad', async () => {
    vi.mocked(client.getAllCourses).mockRejectedValue({
      response: {
        json: async () => ({
          message: 'Unavailable',
          status: 503,
          error: 'Service Unavailable',
        }),
      },
    });

    const { result } = renderHook(() => useCourses(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isError).toBe(true);
    expect(result.current.courses).toEqual([]);
    expect(notify.errorNotification).not.toHaveBeenCalled();
  });

  it('retryLoad refetches the course list', async () => {
    vi.mocked(client.getAllCourses)
      .mockRejectedValueOnce({
        response: {
          json: async () => ({
            message: 'Unavailable',
            status: 503,
            error: 'Service Unavailable',
          }),
        },
      })
      .mockResolvedValueOnce([algebra]);

    const { result } = renderHook(() => useCourses(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    await act(async () => {
      result.current.retryLoad();
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(false);
    });
    expect(result.current.courses).toEqual([algebra]);
    expect(client.getAllCourses).toHaveBeenCalledTimes(2);
  });

  it('createCourse posts, notifies, refreshes, and returns true', async () => {
    vi.mocked(client.getAllCourses).mockResolvedValueOnce([]).mockResolvedValueOnce([algebra]);

    const { result } = renderHook(() => useCourses(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let created = false;
    await act(async () => {
      created = await result.current.createCourse({
        title: 'Algebra',
        description: 'Intro algebra',
        capacity: 30,
      });
    });

    expect(created).toBe(true);
    expect(client.addNewCourse).toHaveBeenCalledWith({
      title: 'Algebra',
      description: 'Intro algebra',
      capacity: 30,
    });
    expect(notify.successNotification).toHaveBeenCalledWith(
      'Course successfully added',
      'Algebra was added to the system'
    );
    await waitFor(() => {
      expect(result.current.courses).toEqual([algebra]);
    });
  });

  it('createCourse notifies on failure and returns false', async () => {
    vi.mocked(client.addNewCourse).mockRejectedValue({
      response: {
        json: async () => ({
          code: 'VALIDATION_FAILED',
          message: 'Invalid',
          status: 400,
          error: 'Bad Request',
        }),
      },
    });

    const { result } = renderHook(() => useCourses(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let created = true;
    await act(async () => {
      created = await result.current.createCourse({
        title: 'Algebra',
        capacity: 30,
      });
    });

    expect(created).toBe(false);
    expect(notify.errorNotification).toHaveBeenCalledWith(
      i18n.t('errors.issueTitle'),
      i18n.t('errors.codes.validationFailed'),
      'bottomLeft'
    );
    expect(result.current.courses).toEqual([]);
  });

  it('updateCourseById puts, notifies, refreshes, and returns true', async () => {
    const updated = { ...algebra, title: 'Algebra II' };
    vi.mocked(client.getAllCourses)
      .mockResolvedValueOnce([algebra])
      .mockResolvedValueOnce([updated]);

    const { result } = renderHook(() => useCourses(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let saved = false;
    await act(async () => {
      saved = await result.current.updateCourseById(1, {
        title: 'Algebra II',
        description: 'Intro algebra',
        capacity: 30,
      });
    });

    expect(saved).toBe(true);
    expect(client.updateCourse).toHaveBeenCalledWith(1, {
      title: 'Algebra II',
      description: 'Intro algebra',
      capacity: 30,
    });
    expect(notify.successNotification).toHaveBeenCalledWith(
      'Course updated',
      'Algebra II was updated'
    );
    await waitFor(() => {
      expect(result.current.courses).toEqual([updated]);
    });
  });

  it('updateCourseById notifies on failure and returns false', async () => {
    vi.mocked(client.getAllCourses).mockResolvedValue([algebra]);
    vi.mocked(client.updateCourse).mockRejectedValue({
      response: {
        json: async () => ({
          code: 'COURSE_NOT_FOUND',
          message: 'Not found',
          status: 404,
          error: 'Not Found',
        }),
      },
    });

    const { result } = renderHook(() => useCourses(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let saved = true;
    await act(async () => {
      saved = await result.current.updateCourseById(1, {
        title: 'Algebra',
        capacity: 30,
      });
    });

    expect(saved).toBe(false);
    expect(notify.errorNotification).toHaveBeenCalledWith(
      i18n.t('errors.issueTitle'),
      i18n.t('errors.codes.courseNotFound'),
      'bottomLeft'
    );
    expect(result.current.courses).toEqual([algebra]);
  });

  it('removeCourseById deletes, notifies, and refreshes', async () => {
    vi.mocked(client.getAllCourses).mockResolvedValueOnce([algebra]).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useCourses(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.removeCourseById(1);
    });

    expect(client.deleteCourse).toHaveBeenCalledWith(1);
    expect(notify.successNotification).toHaveBeenCalledWith(
      'Course deleted',
      'Course with 1 was deleted'
    );
    await waitFor(() => {
      expect(result.current.courses).toEqual([]);
    });
  });

  it('removeCourseById notifies on failure without clearing the list', async () => {
    vi.mocked(client.getAllCourses).mockResolvedValue([algebra]);
    vi.mocked(client.deleteCourse).mockRejectedValue({
      response: {
        json: async () => ({
          code: 'COURSE_NOT_FOUND',
          message: 'Not found',
          status: 404,
          error: 'Not Found',
        }),
      },
    });

    const { result } = renderHook(() => useCourses(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.removeCourseById(1);
    });

    expect(notify.errorNotification).toHaveBeenCalledWith(
      i18n.t('errors.issueTitle'),
      i18n.t('errors.codes.courseNotFound')
    );
    expect(result.current.courses).toEqual([algebra]);
  });
});
