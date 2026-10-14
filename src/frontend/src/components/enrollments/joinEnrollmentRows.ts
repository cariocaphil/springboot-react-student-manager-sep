import type { Course } from '../../types/course';
import type { Enrollment } from '../../types/enrollment';
import type { Student } from '../../types/student';

/** Joined enrollment row for the table. Null names mean orphan IDs after successful lookups. */
export type EnrollmentRow = {
  id: number;
  studentId: number;
  courseId: number;
  enrolledAt: string;
  studentName: string | null;
  courseTitle: string | null;
  capacity: number | null;
  enrollmentCount: number;
  isCourseFull: boolean;
};

export function countEnrollmentsByCourseId(enrollments: Enrollment[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const enrollment of enrollments) {
    counts.set(enrollment.courseId, (counts.get(enrollment.courseId) ?? 0) + 1);
  }
  return counts;
}

/** Join enrollments with student/course lists. Call only when lookup queries succeeded. */
export function joinEnrollmentRows(
  enrollments: Enrollment[],
  students: Student[],
  courses: Course[]
): EnrollmentRow[] {
  const studentsById = new Map(students.map((student) => [student.id, student]));
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  const enrollmentCounts = countEnrollmentsByCourseId(enrollments);

  return enrollments.map((enrollment) => {
    const student = studentsById.get(enrollment.studentId);
    const course = coursesById.get(enrollment.courseId);
    const enrollmentCount = enrollmentCounts.get(enrollment.courseId) ?? 0;
    const capacity = course?.capacity ?? null;

    return {
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
      studentName: student?.name ?? null,
      courseTitle: course?.title ?? null,
      capacity,
      enrollmentCount,
      isCourseFull: capacity !== null && enrollmentCount >= capacity,
    };
  });
}
