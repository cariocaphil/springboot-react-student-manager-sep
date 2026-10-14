import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import EnrollmentsTable from './EnrollmentsTable';
import type { EnrollmentRow } from './joinEnrollmentRows';

const baseRow: EnrollmentRow = {
  id: 100,
  studentId: 1,
  courseId: 10,
  enrolledAt: '2026-01-15T10:30:00Z',
  studentName: 'Ada Lovelace',
  courseTitle: 'Algebra',
  capacity: 30,
  enrollmentCount: 1,
  isCourseFull: false,
};

describe('EnrollmentsTable', () => {
  it('renders unknown labels, dash seats for orphan courses, and a Full tag', () => {
    const rows: EnrollmentRow[] = [
      {
        ...baseRow,
        id: 1,
        studentName: null,
        studentId: 99,
      },
      {
        ...baseRow,
        id: 2,
        courseTitle: null,
        courseId: 88,
        capacity: null,
        enrollmentCount: 1,
        isCourseFull: false,
      },
      {
        ...baseRow,
        id: 3,
        enrollmentCount: 30,
        capacity: 30,
        isCourseFull: true,
      },
    ];

    render(
      <EnrollmentsTable
        rows={rows}
        canManageEnrollments={false}
        onCancel={vi.fn()}
        onAddClick={vi.fn()}
      />
    );

    expect(
      screen.getByText(i18n.t('enrollments.unknownStudent', { id: 99 }))
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('enrollments.unknownCourse', { id: 88 }))
    ).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('30/30')).toBeInTheDocument();
    expect(screen.getByText(i18n.t('enrollments.full'))).toBeInTheDocument();
  });
});
