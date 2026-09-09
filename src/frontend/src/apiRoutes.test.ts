import { describe, expect, it } from 'vitest';
import { studentsApi } from './apiRoutes';

describe('apiRoutes', () => {
  it('exposes the students collection and by-id paths', () => {
    expect(studentsApi.collection).toBe('api/v1/students');
    expect(studentsApi.byId(42)).toBe('api/v1/students/42');
  });
});
