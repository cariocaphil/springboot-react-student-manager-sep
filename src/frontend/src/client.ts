import fetch from 'unfetch';
import { studentsApi } from './apiRoutes';
import type { ApiResponse, HttpError } from './types/api';
import type { NewStudent, Student } from './types/student';

const checkStatus = (response: ApiResponse): ApiResponse => {
  if (response.ok) {
    return response;
  }
  const error = new Error(response.statusText) as HttpError;
  error.response = response;
  throw error;
};

export const getAllStudents = (): Promise<Student[]> =>
  fetch(studentsApi.collection)
    .then(checkStatus)
    .then((response) => response.json<Student[]>());

export const deleteStudent = (studentId: number): Promise<void> =>
  fetch(studentsApi.byId(studentId), {
    method: 'DELETE',
  })
    .then(checkStatus)
    .then(() => undefined);

export const addNewStudent = (student: NewStudent): Promise<void> =>
  fetch(studentsApi.collection, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(student),
  })
    .then(checkStatus)
    .then(() => undefined);
