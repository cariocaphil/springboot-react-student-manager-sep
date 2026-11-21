import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import type { Course, NewCourse } from '../course';
import type { Enrollment, NewEnrollment } from '../enrollment';
import type { NewStudent, Student } from '../student';
import type { CurrentUser } from '../user';
import {
  CourseRequest,
  CourseResponse,
  CurrentUserResponse,
  EnrollmentRequest,
  EnrollmentResponse,
  StudentRequest,
  StudentResponse,
} from './schemas';

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

describe('generated response schemas (static assignability)', () => {
  it('infers types assignable to domain wire types', () => {
    type StudentOk = z.infer<typeof StudentResponse> extends Student ? true : false;
    type CourseOk = z.infer<typeof CourseResponse> extends Course ? true : false;
    type EnrollmentOk = z.infer<typeof EnrollmentResponse> extends Enrollment ? true : false;
    type CurrentUserOk = z.infer<typeof CurrentUserResponse> extends CurrentUser ? true : false;
    type StudentListOk = z.infer<typeof StudentResponse>[] extends Student[] ? true : false;

    expectTypeOf<StudentOk>().toEqualTypeOf<true>();
    expectTypeOf<CourseOk>().toEqualTypeOf<true>();
    expectTypeOf<EnrollmentOk>().toEqualTypeOf<true>();
    expectTypeOf<CurrentUserOk>().toEqualTypeOf<true>();
    expectTypeOf<StudentListOk>().toEqualTypeOf<true>();
  });
});

describe('generated StudentResponse', () => {
  it('accepts a valid payload assignable to Student', () => {
    const result = StudentResponse.safeParse({
      id: 1,
      name: 'Ada',
      email: 'ada@example.com',
      gender: 'FEMALE',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const student: Student = result.data;
      expect(student.id).toBe(1);
    }
  });

  it('rejects missing required fields', () => {
    const result = StudentResponse.safeParse({ id: 1 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid gender enum values', () => {
    const result = StudentResponse.safeParse({
      id: 1,
      name: 'Ada',
      email: 'ada@example.com',
      gender: 'UNKNOWN',
    });
    expect(result.success).toBe(false);
  });

  it('rejects incorrect field types', () => {
    const result = StudentResponse.safeParse({
      id: '1',
      name: 'Ada',
      email: 'ada@example.com',
      gender: 'FEMALE',
    });
    expect(result.success).toBe(false);
  });
});

describe('generated CourseResponse', () => {
  it('accepts a valid payload with optional description omitted', () => {
    const result = CourseResponse.safeParse({
      id: 1,
      title: 'Algebra',
      capacity: 30,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const course: Course = result.data;
      expect(course.description).toBeUndefined();
    }
  });

  it('rejects null description (optional, not nullable)', () => {
    const result = CourseResponse.safeParse({
      id: 1,
      title: 'Algebra',
      capacity: 30,
      description: null,
    });
    expect(result.success).toBe(false);
  });
});

describe('generated EnrollmentResponse', () => {
  it('accepts a valid ISO datetime enrolledAt', () => {
    const result = EnrollmentResponse.safeParse({
      id: 9,
      studentId: 1,
      courseId: 1,
      enrolledAt: '2026-01-15T10:30:00Z',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const enrollment: Enrollment = result.data;
      expect(enrollment.enrolledAt).toBe('2026-01-15T10:30:00Z');
    }
  });

  it('rejects invalid enrolledAt values', () => {
    const result = EnrollmentResponse.safeParse({
      id: 9,
      studentId: 1,
      courseId: 1,
      enrolledAt: 'not-a-datetime',
    });
    expect(result.success).toBe(false);
  });
});

describe('generated CurrentUserResponse', () => {
  it('accepts a valid payload assignable to CurrentUser', () => {
    const result = CurrentUserResponse.safeParse({
      username: 'dev',
      role: 'ADMIN',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const user: CurrentUser = result.data;
      expect(user.role).toBe('ADMIN');
    }
  });

  it('rejects invalid role enum values', () => {
    const result = CurrentUserResponse.safeParse({
      username: 'dev',
      role: 'SUPERUSER',
    });
    expect(result.success).toBe(false);
  });
});

describe('generated response collections', () => {
  it('accepts an empty student collection', () => {
    const result = z.array(StudentResponse).safeParse([]);
    expect(result.success).toBe(true);
    if (result.success) {
      const students: Student[] = result.data;
      expect(students).toEqual([]);
    }
  });
});
