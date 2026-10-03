import { describe, expect, it } from 'vitest';
import { meApi, studentsApi } from './apiRoutes';

describe('apiRoutes', () => {
  it('exposes the students collection and by-id paths', () => {
    expect(studentsApi.collection).toBe('api/v1/students');
    expect(studentsApi.byId(42)).toBe('api/v1/students/42');
  });

  it('exposes the current-user path', () => {
    expect(meApi.current).toBe('api/v1/me');
  });
});
