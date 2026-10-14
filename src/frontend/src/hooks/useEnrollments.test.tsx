import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEnrollments } from './useEnrollments';
import * as client from '../client';
import i18n from '../i18n';
import * as notify from '../Notification';
import { createQueryClient } from '../queryClient';
import type { Course } from '../types/course';
import type { Enrollment } from '../types/enrollment';
import type { Student } from '../types/student';

vi.mock('../client');
vi.mock('../Notification');

const ada: Student = {
  id: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  gender: 'FEMALE',
};

const algebra: Course = {
  id: 10,
  title: 'Algebra',
  capacity: 30,
};

const enrollment: Enrollment = {
  id: 100,
  studentId: 1,
  courseId: 10,
  enrolledAt: '2026-01-15T10:30:00Z',
};

function createWrapper() {
  const queryClient = createQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEnrollments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.getAllEnrollments).mockResolvedValue([]);
    vi.mocked(client.getAllStudents).mockResolvedValue([]);
    vi.mocked(client.getAllCourses).mockResolvedValue([]);
    vi.mocked(client.enrollStudent).mockResolvedValue(undefined);
    vi.mocked(client.deleteEnrollment).mockResolvedValue(undefined);
  });

  it('loads enrollments and joined rows on mount', async () => {
    vi.mocked(client.getAllEnrollments).mockResolvedValue([enrollment]);
    vi.mocked(client.getAllStudents).mockResolvedValue([ada]);
    vi.mocked(client.getAllCourses).mockResolvedValue([algebra]);

    const { result } = renderHook(() => useEnrollments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isError).toBe(false);
    expect(result.current.lookupsReady).toBe(true);
    expect(result.current.rows[0]?.studentName).toBe('Ada Lovelace');
    expect(result.current.rows[0]?.courseTitle).toBe('Algebra');
  });

  it('exposes error when enrollments fail without treating rows as orphans', async () => {
    vi.mocked(client.getAllEnrollments).mockRejectedValue({
      response: {
        json: async () => ({
          message: 'Unavailable',
          status: 503,
          error: 'Service Unavailable',
        }),
      },
    });
    vi.mocked(client.getAllStudents).mockResolvedValue([ada]);
    vi.mocked(client.getAllCourses).mockResolvedValue([algebra]);

    const { result } = renderHook(() => useEnrollments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isError).toBe(true);
    expect(result.current.rows).toEqual([]);
  });

  it('exposes error when student lookup fails', async () => {
    vi.mocked(client.getAllEnrollments).mockResolvedValue([enrollment]);
    vi.mocked(client.getAllStudents).mockRejectedValue({
      response: {
        json: async () => ({
          message: 'Unavailable',
          status: 503,
          error: 'Service Unavailable',
        }),
      },
    });
    vi.mocked(client.getAllCourses).mockResolvedValue([algebra]);

    const { result } = renderHook(() => useEnrollments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.lookupsReady).toBe(false);
    expect(result.current.rows).toEqual([]);
  });

  it('retryLoad refetches all three collections', async () => {
    vi.mocked(client.getAllEnrollments)
      .mockRejectedValueOnce({
        response: {
          json: async () => ({
            message: 'Unavailable',
            status: 503,
            error: 'Service Unavailable',
          }),
        },
      })
      .mockResolvedValueOnce([enrollment]);
    vi.mocked(client.getAllStudents).mockResolvedValue([ada]);
    vi.mocked(client.getAllCourses).mockResolvedValue([algebra]);

    const { result } = renderHook(() => useEnrollments(), {
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
    expect(result.current.rows).toHaveLength(1);
    expect(client.getAllEnrollments).toHaveBeenCalledTimes(2);
  });

  it('createEnrollment posts, notifies, refreshes, and returns true', async () => {
    vi.mocked(client.getAllEnrollments)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([enrollment]);
    vi.mocked(client.getAllStudents).mockResolvedValue([ada]);
    vi.mocked(client.getAllCourses).mockResolvedValue([algebra]);

    const { result } = renderHook(() => useEnrollments(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let created = false;
    await act(async () => {
      created = await result.current.createEnrollment({ studentId: 1, courseId: 10 });
    });

    expect(created).toBe(true);
    expect(client.enrollStudent).toHaveBeenCalledWith({ studentId: 1, courseId: 10 });
    expect(notify.successNotification).toHaveBeenCalledWith(
      'Enrollment created',
      'The student was enrolled in the course'
    );
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(1);
    });
  });

  it('createEnrollment notifies on capacity failure and returns false', async () => {
    vi.mocked(client.getAllStudents).mockResolvedValue([ada]);
    vi.mocked(client.getAllCourses).mockResolvedValue([algebra]);
    vi.mocked(client.enrollStudent).mockRejectedValue({
      response: {
        json: async () => ({
          code: 'COURSE_FULL',
          message: 'Full',
          status: 400,
          error: 'Bad Request',
        }),
      },
    });

    const { result } = renderHook(() => useEnrollments(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let created = true;
    await act(async () => {
      created = await result.current.createEnrollment({ studentId: 1, courseId: 10 });
    });

    expect(created).toBe(false);
    expect(notify.errorNotification).toHaveBeenCalledWith(
      i18n.t('errors.issueTitle'),
      i18n.t('errors.codes.courseFull'),
      'bottomLeft'
    );
  });

  it('createEnrollment notifies on duplicate enrollment and returns false', async () => {
    vi.mocked(client.getAllStudents).mockResolvedValue([ada]);
    vi.mocked(client.getAllCourses).mockResolvedValue([algebra]);
    vi.mocked(client.enrollStudent).mockRejectedValue({
      response: {
        json: async () => ({
          code: 'DUPLICATE_ENROLLMENT',
          message: 'Duplicate',
          status: 400,
          error: 'Bad Request',
        }),
      },
    });

    const { result } = renderHook(() => useEnrollments(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let created = true;
    await act(async () => {
      created = await result.current.createEnrollment({ studentId: 1, courseId: 10 });
    });

    expect(created).toBe(false);
    expect(notify.errorNotification).toHaveBeenCalledWith(
      i18n.t('errors.issueTitle'),
      i18n.t('errors.codes.duplicateEnrollment'),
      'bottomLeft'
    );
  });

  it('removeEnrollmentById deletes, notifies, and refreshes', async () => {
    vi.mocked(client.getAllEnrollments)
      .mockResolvedValueOnce([enrollment])
      .mockResolvedValueOnce([]);
    vi.mocked(client.getAllStudents).mockResolvedValue([ada]);
    vi.mocked(client.getAllCourses).mockResolvedValue([algebra]);

    const { result } = renderHook(() => useEnrollments(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.removeEnrollmentById(100);
    });

    expect(client.deleteEnrollment).toHaveBeenCalledWith(100);
    expect(notify.successNotification).toHaveBeenCalledWith(
      'Enrollment cancelled',
      'Enrollment with 100 was cancelled'
    );
    await waitFor(() => {
      expect(result.current.rows).toEqual([]);
    });
  });

  it('removeEnrollmentById notifies on failure without clearing rows', async () => {
    vi.mocked(client.getAllEnrollments).mockResolvedValue([enrollment]);
    vi.mocked(client.getAllStudents).mockResolvedValue([ada]);
    vi.mocked(client.getAllCourses).mockResolvedValue([algebra]);
    vi.mocked(client.deleteEnrollment).mockRejectedValue({
      response: {
        json: async () => ({
          code: 'ENROLLMENT_NOT_FOUND',
          message: 'Not found',
          status: 404,
          error: 'Not Found',
        }),
      },
    });

    const { result } = renderHook(() => useEnrollments(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.removeEnrollmentById(100);
    });

    expect(notify.errorNotification).toHaveBeenCalledWith(
      i18n.t('errors.issueTitle'),
      i18n.t('errors.codes.enrollmentNotFound')
    );
    expect(result.current.rows).toHaveLength(1);
  });
});
