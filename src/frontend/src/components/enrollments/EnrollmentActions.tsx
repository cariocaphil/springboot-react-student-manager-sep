import { Popconfirm, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import type { EnrollmentRow } from './joinEnrollmentRows';

interface EnrollmentActionsProps {
  enrollment: EnrollmentRow;
  onCancel: (enrollmentId: number) => void;
}

function EnrollmentActions({ enrollment, onCancel }: EnrollmentActionsProps) {
  const { t } = useTranslation();
  const studentLabel =
    enrollment.studentName ?? t('enrollments.unknownStudent', { id: enrollment.studentId });
  const courseLabel =
    enrollment.courseTitle ?? t('enrollments.unknownCourse', { id: enrollment.courseId });

  return (
    <Radio.Group>
      <Popconfirm
        placement="topRight"
        title={t('enrollments.actions.cancelConfirm', {
          student: studentLabel,
          course: courseLabel,
        })}
        onConfirm={() => {
          void onCancel(enrollment.id);
        }}
        okText={t('enrollments.actions.yes')}
        cancelText={t('enrollments.actions.no')}
      >
        <Radio.Button value="cancel">{t('enrollments.actions.cancel')}</Radio.Button>
      </Popconfirm>
    </Radio.Group>
  );
}

export default EnrollmentActions;
