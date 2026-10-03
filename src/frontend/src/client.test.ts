import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetch from 'unfetch';
import { meApi, studentsApi } from './apiRoutes';
import {
  clearAuthCredentials,
  encodeBasicAuthorizationHeader,
  setAuthCredentials,
  setUnauthorizedHandler,
} from './auth/authCredentials';
import { addNewStudent, deleteStudent, getAllStudents, getCurrentUser } from './client';
import type { ApiResponse } from './types/api';
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
});
