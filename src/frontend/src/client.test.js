import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetch from 'unfetch';
import { addNewStudent, deleteStudent, getAllStudents } from './client';

vi.mock('unfetch', () => ({
  default: vi.fn(),
}));

describe('client', () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  it('getAllStudents GETs api/v1/students when response is ok', async () => {
    const response = { ok: true, status: 200 };
    fetch.mockResolvedValue(response);

    await expect(getAllStudents()).resolves.toBe(response);
    expect(fetch).toHaveBeenCalledWith('api/v1/students');
  });

  it('getAllStudents rejects with response attached when not ok', async () => {
    const response = { ok: false, status: 500, statusText: 'Server Error' };
    fetch.mockResolvedValue(response);

    await expect(getAllStudents()).rejects.toMatchObject({
      message: 'Server Error',
      response,
    });
  });

  it('deleteStudent DELETEs by id', async () => {
    const response = { ok: true, status: 200 };
    fetch.mockResolvedValue(response);

    await expect(deleteStudent(42)).resolves.toBe(response);
    expect(fetch).toHaveBeenCalledWith('api/v1/students/42', { method: 'DELETE' });
  });

  it('addNewStudent POSTs JSON body', async () => {
    const response = { ok: true, status: 200 };
    const student = { name: 'Ada', email: 'ada@example.com', gender: 'FEMALE' };
    fetch.mockResolvedValue(response);

    await expect(addNewStudent(student)).resolves.toBe(response);
    expect(fetch).toHaveBeenCalledWith('api/v1/students', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(student),
    });
  });
});
