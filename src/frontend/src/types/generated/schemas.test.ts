import { describe, expect, expectTypeOf, it } from 'vitest';
import type { NewCourse } from '../course';
import type { NewEnrollment } from '../enrollment';
import type { NewStudent } from '../student';
import { CourseRequest, EnrollmentRequest, StudentRequest } from './schemas';

describe('generated StudentRequest', () => {
  it('accepts a valid payload assignable to NewStudent', () => {
    const result = StudentRequest.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      gender: 'FEMALE',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const student: NewStudent = result.data;
      expect(student.email).toBe('ada@example.com');
    }
  });

  it('rejects missing required fields', () => {
    const result = StudentRequest.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(expect.arrayContaining(['name', 'email', 'gender']));
    }
  });

  it('rejects invalid email format from the OpenAPI contract', () => {
    const result = StudentRequest.safeParse({
      name: 'Ada',
      email: 'not-an-email',
      gender: 'FEMALE',
    });
    expect(result.success).toBe(false);
  });
});

describe('generated CourseRequest', () => {
  it('accepts a valid payload assignable to NewCourse', () => {
    const result = CourseRequest.safeParse({
      title: 'Algorithms',
      capacity: 30,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const course: NewCourse = result.data;
      expect(course.capacity).toBe(30);
    }
  });

  it('rejects missing required fields', () => {
    const result = CourseRequest.safeParse({ description: 'optional only' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(expect.arrayContaining(['title', 'capacity']));
    }
  });

  it('rejects capacity below the OpenAPI minimum', () => {
    const result = CourseRequest.safeParse({ title: 'Algorithms', capacity: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer capacity', () => {
    const result = CourseRequest.safeParse({ title: 'Algorithms', capacity: 1.5 });
    expect(result.success).toBe(false);
  });
});

describe('generated EnrollmentRequest', () => {
  it('accepts a valid payload assignable to NewEnrollment', () => {
    const result = EnrollmentRequest.safeParse({
      studentId: 1,
      courseId: 2,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const enrollment: NewEnrollment = result.data;
      expect(enrollment.studentId).toBe(1);
    }
  });

  it('rejects missing required fields', () => {
    const result = EnrollmentRequest.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(expect.arrayContaining(['studentId', 'courseId']));
    }
  });

  it('rejects non-numeric enrollment ids', () => {
    const result = EnrollmentRequest.safeParse({
      studentId: '1',
      courseId: '2',
    });
    expect(result.success).toBe(false);
  });

  it('keeps int64 ids as numbers without inventing a positive minimum', () => {
    const result = EnrollmentRequest.safeParse({
      studentId: 0,
      courseId: -1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.studentId).toBe('number');
      expect(typeof result.data.courseId).toBe('number');
      expect(result.data.studentId).not.toBeTypeOf('bigint');
      expect(result.data.courseId).not.toBeTypeOf('bigint');
    }
  });

  it('infers number (not bigint) for enrollment ids', () => {
    expectTypeOf<typeof EnrollmentRequest._output.studentId>().toEqualTypeOf<number>();
    expectTypeOf<typeof EnrollmentRequest._output.courseId>().toEqualTypeOf<number>();
  });
});
