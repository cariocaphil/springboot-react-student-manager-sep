import fetch from 'unfetch';
import { meApi, studentsApi } from './apiRoutes';
import { getAuthorizationHeader, notifyUnauthorized } from './auth/authCredentials';
import type { ApiResponse, HttpError } from './types/api';
import type { NewStudent, Student } from './types/student';
import type { CurrentUser } from './types/user';

type RequestInitLike = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

const checkStatus = (response: ApiResponse): ApiResponse => {
  if (response.ok) {
    return response;
  }
  if (response.status === 401) {
    notifyUnauthorized();
  }
  const error = new Error(response.statusText) as HttpError;
  error.response = response;
  throw error;
};

function withAuthHeaders(headers: Record<string, string> = {}): Record<string, string> {
  const authorization = getAuthorizationHeader();
  if (authorization === undefined) {
    return headers;
  }
  return { ...headers, Authorization: authorization };
}

function apiFetch(url: string, init: RequestInitLike = {}): Promise<ApiResponse> {
  return fetch(url, {
    ...init,
    headers: withAuthHeaders(init.headers),
  }).then(checkStatus);
}

export const getCurrentUser = (): Promise<CurrentUser> =>
  apiFetch(meApi.current).then((response) => response.json<CurrentUser>());

export const getAllStudents = (): Promise<Student[]> =>
  apiFetch(studentsApi.collection).then((response) => response.json<Student[]>());

export const deleteStudent = (studentId: number): Promise<void> =>
  apiFetch(studentsApi.byId(studentId), {
    method: 'DELETE',
  }).then(() => undefined);

export const addNewStudent = (student: NewStudent): Promise<void> =>
  apiFetch(studentsApi.collection, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(student),
  }).then(() => undefined);
