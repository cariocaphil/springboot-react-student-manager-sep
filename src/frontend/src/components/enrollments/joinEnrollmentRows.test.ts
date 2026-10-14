import { describe, expect, it } from 'vitest';
import type { Course } from '../../types/course';
import type { Enrollment } from '../../types/enrollment';
import type { Student } from '../../types/student';
import { countEnrollmentsByCourseId, joinEnrollmentRows } from './joinEnrollmentRows';

const ada: Student = {
  id: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  gender: 'FEMALE',
};

const algebra: Course = {
  id: 10,
  title: 'Algebra',
  capacity: 2,
};

const enrollment: Enrollment = {
  id: 100,
  studentId: 1,
  courseId: 10,
  enrolledAt: '2026-01-15T10:30:00Z',
};

describe('joinEnrollmentRows', () => {
  it('joins student name, course title, and seat counts', () => {
    const rows = joinEnrollmentRows([enrollment], [ada], [algebra]);

    expect(rows).toEqual([
      {
        id: 100,
        studentId: 1,
        courseId: 10,
        enrolledAt: '2026-01-15T10:30:00Z',
        studentName: 'Ada Lovelace',
        courseTitle: 'Algebra',
        capacity: 2,
        enrollmentCount: 1,
        isCourseFull: false,
      },
    ]);
  });

  it('marks unknown names null for orphan student ids and full courses', () => {
    const orphan: Enrollment = {
      id: 101,
      studentId: 99,
      courseId: 10,
      enrolledAt: '2026-01-16T10:30:00Z',
    };
    const second: Enrollment = {
      id: 102,
      studentId: 1,
      courseId: 10,
      enrolledAt: '2026-01-17T10:30:00Z',
    };

    const rows = joinEnrollmentRows([enrollment, orphan, second], [ada], [algebra]);

    expect(rows[1]?.studentName).toBeNull();
    expect(rows[1]?.courseTitle).toBe('Algebra');
    expect(rows.every((row) => row.enrollmentCount === 3)).toBe(true);
    expect(rows.every((row) => row.isCourseFull)).toBe(true);
  });

  it('marks course fields null for orphan course ids without treating them as full', () => {
    const orphanCourse: Enrollment = {
      id: 103,
      studentId: 1,
      courseId: 99,
      enrolledAt: '2026-01-18T10:30:00Z',
    };

    const [row] = joinEnrollmentRows([orphanCourse], [ada], [algebra]);

    expect(row).toMatchObject({
      studentName: 'Ada Lovelace',
      courseTitle: null,
      capacity: null,
      enrollmentCount: 1,
      isCourseFull: false,
    });
  });
});

describe('countEnrollmentsByCourseId', () => {
  it('counts enrollments per course', () => {
    const counts = countEnrollmentsByCourseId([
      enrollment,
      { ...enrollment, id: 101, studentId: 2 },
    ]);
    expect(counts.get(10)).toBe(2);
  });
});
