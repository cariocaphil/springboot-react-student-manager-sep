import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetch from 'unfetch';
import { studentsApi } from './apiRoutes';
import { addNewStudent, deleteStudent, getAllStudents } from './client';
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
    expect(mockedFetch).toHaveBeenCalledWith(studentsApi.collection);
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
