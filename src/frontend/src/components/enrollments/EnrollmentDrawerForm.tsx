import { Drawer, Col, Form, Row, Button, Select, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { validationStatus } from '../../utils/form';
import type { Course } from '../../types/course';
import type { Enrollment, NewEnrollment } from '../../types/enrollment';
import type { Student } from '../../types/student';
import { countEnrollmentsByCourseId } from './joinEnrollmentRows';
import {
  createEnrollmentFormSchema,
  createNewEnrollmentFromForm,
  defaultValues,
  type EnrollmentFormValues,
} from './enrollmentForm';
import EnrollmentDrawerFooter from './EnrollmentDrawerFooter';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const { Option } = Select;

interface EnrollmentDrawerFormProps {
  open: boolean;
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  onClose: () => void;
  onSave: (enrollment: NewEnrollment) => Promise<boolean>;
}

function EnrollmentDrawerForm({
  open,
  students,
  courses,
  enrollments,
  onClose,
  onSave,
}: EnrollmentDrawerFormProps) {
  const { t, i18n } = useTranslation();
  const schema = useMemo(() => createEnrollmentFormSchema(i18n.language), [i18n.language]);
  const enrollmentCounts = countEnrollmentsByCourseId(enrollments);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnrollmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      return;
    }
    reset(defaultValues);
  }, [open, reset]);

  const onSubmit = async (values: EnrollmentFormValues) => {
    const enrollment = createNewEnrollmentFromForm(values);
    const saved = await onSave(enrollment);
    if (saved) {
      reset(defaultValues);
      onClose();
    }
  };

  return (
    <Drawer
      title={t('enrollments.drawer.title')}
      width={720}
      onClose={onClose}
      open={open}
      styles={{ body: { paddingBottom: 80 } }}
      footer={<EnrollmentDrawerFooter onClose={onClose} />}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={24}>
            <Controller
              name="studentId"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label={t('enrollments.form.student.label')}
                  required
                  validateStatus={validationStatus(!!errors.studentId)}
                  help={errors.studentId?.message}
                >
                  <Select
                    placeholder={t('enrollments.form.student.placeholder')}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    showSearch
                    optionFilterProp="label"
                  >
                    {students.map((student) => (
                      <Option key={student.id} value={student.id} label={student.name}>
                        {student.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            />
          </Col>
          <Col span={24}>
            <Controller
              name="courseId"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label={t('enrollments.form.course.label')}
                  required
                  validateStatus={validationStatus(!!errors.courseId)}
                  help={errors.courseId?.message}
                >
                  <Select
                    placeholder={t('enrollments.form.course.placeholder')}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    showSearch
                    optionFilterProp="label"
                  >
                    {courses.map((course) => {
                      const count = enrollmentCounts.get(course.id) ?? 0;
                      const isFull = count >= course.capacity;
                      const seatsLabel = t('enrollments.form.course.seatsLabel', {
                        title: course.title,
                        count,
                        capacity: course.capacity,
                      });
                      const label = isFull
                        ? t('enrollments.form.course.fullLabel', { label: seatsLabel })
                        : seatsLabel;
                      return (
                        <Option key={course.id} value={course.id} label={label} disabled={isFull}>
                          {label}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              )}
            />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {t('enrollments.drawer.submit')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Row>{isSubmitting && <Spin indicator={antIcon} />}</Row>
      </form>
    </Drawer>
  );
}

export default EnrollmentDrawerForm;
