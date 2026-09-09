import fetch from 'unfetch';
import type { ApiResponse, HttpError, NewStudent, Student } from './types';

const checkStatus = (response: ApiResponse): ApiResponse => {
  if (response.ok) {
    return response;
  }
  const error = new Error(response.statusText) as HttpError;
  error.response = response;
  throw error;
};

export const getAllStudents = (): Promise<Student[]> =>
  fetch('api/v1/students')
    .then(checkStatus)
    .then((response) => response.json<Student[]>());

export const deleteStudent = (studentId: number): Promise<void> =>
  fetch(`api/v1/students/${studentId}`, {
    method: 'DELETE',
  })
    .then(checkStatus)
    .then(() => undefined);

export const addNewStudent = (student: NewStudent): Promise<void> =>
  fetch('api/v1/students', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(student),
  })
    .then(checkStatus)
    .then(() => undefined);
