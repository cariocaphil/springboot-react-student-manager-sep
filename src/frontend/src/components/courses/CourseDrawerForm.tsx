import { Drawer, Col, Form, Row, Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import type { Course, NewCourse } from '../../types/course';
import {
  createCourseFormSchema,
  createNewCourseFromForm,
  defaultValues,
  courseToFormValues,
  type CourseFormValues,
} from './courseForm';
import { courseFormFields, groupCourseFormFieldsIntoRows } from './courseFormFields';
import CourseDrawerFooter from './CourseDrawerFooter';
import CourseFormField from './CourseFormField';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const courseFormRows = groupCourseFormFieldsIntoRows(courseFormFields);

interface CourseDrawerFormProps {
  open: boolean;
  editingCourse?: Course | null;
  onClose: () => void;
  onSave: (course: NewCourse) => Promise<boolean>;
}

function CourseDrawerForm({ open, editingCourse = null, onClose, onSave }: CourseDrawerFormProps) {
  const { t, i18n } = useTranslation();
  const schema = useMemo(() => createCourseFormSchema(i18n.language), [i18n.language]);
  const isEditing = editingCourse !== null;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      return;
    }
    if (editingCourse !== null) {
      reset(courseToFormValues(editingCourse));
    } else {
      reset(defaultValues);
    }
  }, [open, editingCourse, reset]);

  const onSubmit = async (values: CourseFormValues) => {
    const course = createNewCourseFromForm(values);
    const saved = await onSave(course);
    if (saved) {
      reset(defaultValues);
      onClose();
    }
  };

  return (
    <Drawer
      title={isEditing ? t('courses.drawer.editTitle') : t('courses.drawer.title')}
      width={720}
      onClose={onClose}
      open={open}
      styles={{ body: { paddingBottom: 80 } }}
      footer={<CourseDrawerFooter onClose={onClose} />}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {courseFormRows.map((row, rowIndex) => (
          <Row gutter={16} key={rowIndex}>
            {row.map((field) => (
              <Col span={field.span} key={field.name}>
                <CourseFormField field={field} control={control} errors={errors} />
              </Col>
            ))}
          </Row>
        ))}
        <Row>
          <Col span={12}>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {isEditing ? t('courses.drawer.editSubmit') : t('courses.drawer.submit')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Row>{isSubmitting && <Spin indicator={antIcon} />}</Row>
      </form>
    </Drawer>
  );
}

export default CourseDrawerForm;
