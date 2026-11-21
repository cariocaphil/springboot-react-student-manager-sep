import fetch from 'unfetch';
import { z } from 'zod';
import { coursesApi, enrollmentsApi, meApi, studentsApi } from './apiRoutes';
import { getAuthorizationHeader, notifyUnauthorized } from './auth/authCredentials';
import { parseApiResponse } from './parseApiResponse';
import type { ApiResponse, HttpError } from './types/api';
import type { Course, NewCourse } from './types/course';
import type { Enrollment, NewEnrollment } from './types/enrollment';
import type { NewStudent, Student } from './types/student';
import type { CurrentUser } from './types/user';
import {
  CourseResponse,
  CurrentUserResponse,
  EnrollmentResponse,
  StudentResponse,
} from './types/generated/schemas';

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

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await apiFetch(meApi.current);
  const data: unknown = await response.json();
  return parseApiResponse(CurrentUserResponse, data);
};

export const getAllStudents = async (): Promise<Student[]> => {
  const response = await apiFetch(studentsApi.collection);
  const data: unknown = await response.json();
  return parseApiResponse(z.array(StudentResponse), data);
};

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

export const updateStudent = (studentId: number, student: NewStudent): Promise<void> =>
  apiFetch(studentsApi.byId(studentId), {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    body: JSON.stringify(student),
  }).then(() => undefined);

export const getAllCourses = async (): Promise<Course[]> => {
  const response = await apiFetch(coursesApi.collection);
  const data: unknown = await response.json();
  return parseApiResponse(z.array(CourseResponse), data);
};

export const deleteCourse = (courseId: number): Promise<void> =>
  apiFetch(coursesApi.byId(courseId), {
    method: 'DELETE',
  }).then(() => undefined);

export const addNewCourse = (course: NewCourse): Promise<void> =>
  apiFetch(coursesApi.collection, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(course),
  }).then(() => undefined);

export const updateCourse = (courseId: number, course: NewCourse): Promise<void> =>
  apiFetch(coursesApi.byId(courseId), {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    body: JSON.stringify(course),
  }).then(() => undefined);

export const getAllEnrollments = async (): Promise<Enrollment[]> => {
  const response = await apiFetch(enrollmentsApi.collection);
  const data: unknown = await response.json();
  return parseApiResponse(z.array(EnrollmentResponse), data);
};

export const enrollStudent = (enrollment: NewEnrollment): Promise<void> =>
  apiFetch(enrollmentsApi.collection, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(enrollment),
  }).then(() => undefined);

export const deleteEnrollment = (enrollmentId: number): Promise<void> =>
  apiFetch(enrollmentsApi.byId(enrollmentId), {
    method: 'DELETE',
  }).then(() => undefined);
