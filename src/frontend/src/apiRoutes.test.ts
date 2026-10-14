import { describe, expect, it } from 'vitest';
import { coursesApi, enrollmentsApi, meApi, studentsApi } from './apiRoutes';

describe('apiRoutes', () => {
  it('exposes the students collection and by-id paths', () => {
    expect(studentsApi.collection).toBe('api/v1/students');
    expect(studentsApi.byId(42)).toBe('api/v1/students/42');
  });

  it('exposes the courses collection and by-id paths', () => {
    expect(coursesApi.collection).toBe('api/v1/courses');
    expect(coursesApi.byId(7)).toBe('api/v1/courses/7');
  });

  it('exposes the enrollments collection and by-id paths', () => {
    expect(enrollmentsApi.collection).toBe('api/v1/enrollments');
    expect(enrollmentsApi.byId(9)).toBe('api/v1/enrollments/9');
  });

  it('exposes the current-user path', () => {
    expect(meApi.current).toBe('api/v1/me');
  });
});
