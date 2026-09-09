import fetch from 'unfetch';
import type { ApiResponse, HttpError, NewStudent } from './types';

const checkStatus = (response: ApiResponse): ApiResponse => {
  if (response.ok) {
    return response;
  }
  const error = new Error(response.statusText) as HttpError;
  error.response = response;
  throw error;
};

export const getAllStudents = (): Promise<ApiResponse> =>
  fetch('api/v1/students').then(checkStatus);

export const deleteStudent = (studentId: number): Promise<ApiResponse> =>
  fetch(`api/v1/students/${studentId}`, {
    method: 'DELETE',
  }).then(checkStatus);

export const addNewStudent = (student: NewStudent): Promise<ApiResponse> =>
  fetch('api/v1/students', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(student),
  }).then(checkStatus);
