import { describe, expect, it } from 'vitest';
import { createNewEnrollmentFromForm, enrollmentFormSchema } from './enrollmentForm';

describe('enrollmentFormSchema (constraints)', () => {
  it('accepts numeric student and course ids', () => {
    expect(enrollmentFormSchema.safeParse({ studentId: 1, courseId: 2 }).success).toBe(true);
  });

  it('rejects missing ids as invalid_type', () => {
    const result = enrollmentFormSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => `${String(i.path[0])}:${i.code}`).sort()).toEqual([
        'courseId:invalid_type',
        'studentId:invalid_type',
      ]);
    }
  });
});

describe('createNewEnrollmentFromForm', () => {
  it('maps validated form values to NewEnrollment', () => {
    expect(createNewEnrollmentFromForm({ studentId: 1, courseId: 2 })).toEqual({
      studentId: 1,
      courseId: 2,
    });
  });
});
