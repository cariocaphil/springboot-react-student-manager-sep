import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import EnrollmentActions from './EnrollmentActions';
import type { EnrollmentRow } from './joinEnrollmentRows';

type UseEnrollmentColumnsOptions = {
  canManageEnrollments: boolean;
  onCancel: (enrollmentId: number) => void;
};

export function useEnrollmentColumns({
  canManageEnrollments,
  onCancel,
}: UseEnrollmentColumnsOptions): ColumnsType<EnrollmentRow> {
  const { t, i18n } = useTranslation();

  const columns: ColumnsType<EnrollmentRow> = [
    {
      title: t('enrollments.columns.id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('enrollments.columns.student'),
      key: 'student',
      render: (_text, row) =>
        row.studentName ?? t('enrollments.unknownStudent', { id: row.studentId }),
    },
    {
      title: t('enrollments.columns.course'),
      key: 'course',
      render: (_text, row) =>
        row.courseTitle ?? t('enrollments.unknownCourse', { id: row.courseId }),
    },
    {
      title: t('enrollments.columns.enrolledAt'),
      dataIndex: 'enrolledAt',
      key: 'enrolledAt',
      render: (enrolledAt: string) =>
        new Date(enrolledAt).toLocaleString(i18n.language, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
    },
    {
      title: t('enrollments.columns.seats'),
      key: 'seats',
      render: (_text, row) => {
        if (row.capacity === null) {
          return '—';
        }
        const seats = `${row.enrollmentCount}/${row.capacity}`;
        if (row.isCourseFull) {
          return (
            <>
              {seats} <Tag color="error">{t('enrollments.full')}</Tag>
            </>
          );
        }
        return seats;
      },
    },
  ];

  if (canManageEnrollments) {
    columns.push({
      title: t('enrollments.columns.actions'),
      key: 'actions',
      render: (_text, enrollment) => (
        <EnrollmentActions enrollment={enrollment} onCancel={onCancel} />
      ),
    });
  }

  return columns;
}
