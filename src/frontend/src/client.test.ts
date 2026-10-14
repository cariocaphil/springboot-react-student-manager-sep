import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetch from 'unfetch';
import { coursesApi, enrollmentsApi, meApi, studentsApi } from './apiRoutes';
import {
  clearAuthCredentials,
  encodeBasicAuthorizationHeader,
  setAuthCredentials,
  setUnauthorizedHandler,
} from './auth/authCredentials';
import {
  addNewCourse,
  addNewStudent,
  deleteCourse,
  deleteEnrollment,
  deleteStudent,
  enrollStudent,
  getAllCourses,
  getAllEnrollments,
  getAllStudents,
  getCurrentUser,
  updateCourse,
  updateStudent,
} from './client';
import type { ApiResponse } from './types/api';
import type { Course } from './types/course';
import type { Enrollment } from './types/enrollment';
import type { Student } from './types/student';

vi.mock('unfetch', () => ({
  default: vi.fn(),
}));

const mockedFetch = vi.mocked(fetch);

const ada: Student = {
  id: 1,
  name: 'Ada',
  email: 'ada@example.com',
  gender: 'FEMALE',
};

const algebra: Course = {
  id: 1,
  title: 'Algebra',
  description: 'Intro algebra',
  capacity: 30,
};

const enrollment: Enrollment = {
  id: 9,
  studentId: 1,
  courseId: 1,
  enrolledAt: '2026-01-15T10:30:00Z',
};

describe('client', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    clearAuthCredentials();
    setUnauthorizedHandler(null);
  });

  it('getCurrentUser GETs /api/v1/me and returns parsed JSON', async () => {
    const me = { username: 'dev', role: 'ADMIN' as const };
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => me,
    } as ApiResponse;
    mockedFetch.mockResolvedValue(response as never);

    await expect(getCurrentUser()).resolves.toEqual(me);
    expect(mockedFetch).toHaveBeenCalledWith(meApi.current, {
      headers: {},
    });
  });

  it('getAllStudents GETs the students collection and returns parsed JSON', async () => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => [ada],
    } as ApiResponse;
    mockedFetch.mockResolvedValue(response as never);

    await expect(getAllStudents()).resolves.toEqual([ada]);
    expect(mockedFetch).toHaveBeenCalledWith(studentsApi.collection, {
      headers: {},
    });
  });

  it('attaches Authorization when credentials are set', async () => {
    setAuthCredentials({ username: 'dev', password: 'changeme' });
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => [ada],
    } as ApiResponse;
    mockedFetch.mockResolvedValue(response as never);

    await getAllStudents();

    expect(mockedFetch).toHaveBeenCalledWith(studentsApi.collection, {
      headers: {
        Authorization: encodeBasicAuthorizationHeader('dev', 'changeme'),
      },
    });
  });

  it('getAllStudents rejects with response attached when not ok', async () => {
    const response = {
      ok: false,
      status: 500,
      statusText: 'Server Error',
    } as ApiResponse;
    mockedFetch.mockResolvedValue(response as never);

    await expect(getAllStudents()).rejects.toMatchObject({
      message: 'Server Error',
      response,
    });
  });

  it('notifies unauthorized handler on 401', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    const response = {
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as ApiResponse;
    mockedFetch.mockResolvedValue(response as never);

    await expect(getAllStudents()).rejects.toMatchObject({
      message: 'Unauthorized',
      response,
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('deleteStudent DELETEs by id', async () => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => undefined,
    } as ApiResponse;
    mockedFetch.mockResolvedValue(response as never);

    await expect(deleteStudent(42)).resolves.toBeUndefined();
    expect(mockedFetch).toHaveBeenCalledWith(studentsApi.byId(42), {
      method: 'DELETE',
      headers: {},
    });
  });

  it('addNewStudent POSTs JSON body', async () => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => undefined,
    } as ApiResponse;
    const student = { name: 'Ada', email: 'ada@example.com', gender: 'FEMALE' as const };
    mockedFetch.mockResolvedValue(response as never);

    await expect(addNewStudent(student)).resolves.toBeUndefined();
    expect(mockedFetch).toHaveBeenCalledWith(studentsApi.collection, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(student),
    });
  });

  it('updateStudent PUTs JSON body by id', async () => {
    const response = {
      ok: true,
      status: 204,
      statusText: 'No Content',
      json: async () => undefined,
    } as ApiResponse;
    const student = { name: 'Ada', email: 'ada@example.com', gender: 'FEMALE' as const };
    mockedFetch.mockResolvedValue(response as never);

    await expect(updateStudent(42, student)).resolves.toBeUndefined();
    expect(mockedFetch).toHaveBeenCalledWith(studentsApi.byId(42), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(student),
    });
  });

  it('getAllCourses GETs the courses collection and returns parsed JSON', async () => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => [algebra],
    } as ApiResponse;
    mockedFetch.mockResolvedValue(response as never);

    await expect(getAllCourses()).resolves.toEqual([algebra]);
    expect(mockedFetch).toHaveBeenCalledWith(coursesApi.collection, {
      headers: {},
    });
  });

  it('deleteCourse DELETEs by id', async () => {
    const response = {
      ok: true,
      status: 204,
      statusText: 'No Content',
      json: async () => undefined,
    } as ApiResponse;
    mockedFetch.mockResolvedValue(response as never);

    await expect(deleteCourse(7)).resolves.toBeUndefined();
    expect(mockedFetch).toHaveBeenCalledWith(coursesApi.byId(7), {
      method: 'DELETE',
      headers: {},
    });
  });

  it('addNewCourse POSTs JSON body', async () => {
    const response = {
      ok: true,
      status: 201,
      statusText: 'Created',
      json: async () => undefined,
    } as ApiResponse;
    const course = { title: 'Algebra', description: 'Intro algebra', capacity: 30 };
    mockedFetch.mockResolvedValue(response as never);

    await expect(addNewCourse(course)).resolves.toBeUndefined();
    expect(mockedFetch).toHaveBeenCalledWith(coursesApi.collection, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(course),
    });
  });

  it('updateCourse PUTs JSON body by id', async () => {
    const response = {
      ok: true,
      status: 204,
      statusText: 'No Content',
      json: async () => undefined,
    } as ApiResponse;
    const course = { title: 'Algebra II', capacity: 25 };
    mockedFetch.mockResolvedValue(response as never);

    await expect(updateCourse(7, course)).resolves.toBeUndefined();
    expect(mockedFetch).toHaveBeenCalledWith(coursesApi.byId(7), {
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify(course),
    });
  });

  it('getAllEnrollments GETs the enrollments collection and returns parsed JSON', async () => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => [enrollment],
    } as ApiResponse;
    mockedFetch.mockResolvedValue(response as never);

    await expect(getAllEnrollments()).resolves.toEqual([enrollment]);
    expect(mockedFetch).toHaveBeenCalledWith(enrollmentsApi.collection, {
      headers: {},
    });
  });

  it('enrollStudent POSTs JSON body', async () => {
    const response = {
      ok: true,
      status: 201,
      statusText: 'Created',
      json: async () => undefined,
    } as ApiResponse;
    const body = { studentId: 1, courseId: 1 };
    mockedFetch.mockResolvedValue(response as never);

    await expect(enrollStudent(body)).resolves.toBeUndefined();
    expect(mockedFetch).toHaveBeenCalledWith(enrollmentsApi.collection, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(body),
    });
  });

  it('deleteEnrollment DELETEs by id', async () => {
    const response = {
      ok: true,
      status: 204,
      statusText: 'No Content',
      json: async () => undefined,
    } as ApiResponse;
    mockedFetch.mockResolvedValue(response as never);

    await expect(deleteEnrollment(9)).resolves.toBeUndefined();
    expect(mockedFetch).toHaveBeenCalledWith(enrollmentsApi.byId(9), {
      method: 'DELETE',
      headers: {},
    });
  });
});
