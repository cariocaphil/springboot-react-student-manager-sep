import { Drawer, Col, Form, Row, Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import type { NewStudent, Student } from '../../types/student';
import {
  createNewStudentFromForm,
  createStudentFormSchema,
  defaultValues,
  studentToFormValues,
  type StudentFormValues,
} from './studentForm';
import { groupStudentFormFieldsIntoRows, studentFormFields } from './studentFormFields';
import StudentDrawerFooter from './StudentDrawerFooter';
import StudentFormField from './StudentFormField';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const studentFormRows = groupStudentFormFieldsIntoRows(studentFormFields);

interface StudentDrawerFormProps {
  open: boolean;
  editingStudent?: Student | null;
  onClose: () => void;
  onSave: (student: NewStudent) => Promise<boolean>;
}

function StudentDrawerForm({
  open,
  editingStudent = null,
  onClose,
  onSave,
}: StudentDrawerFormProps) {
  const { t, i18n } = useTranslation();
  const schema = useMemo(() => createStudentFormSchema(i18n.language), [i18n.language]);
  const isEditing = editingStudent !== null;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      return;
    }
    if (editingStudent !== null) {
      reset(studentToFormValues(editingStudent));
    } else {
      reset(defaultValues);
    }
  }, [open, editingStudent, reset]);

  const onSubmit = async (values: StudentFormValues) => {
    const student = createNewStudentFromForm(values);
    const saved = await onSave(student);
    if (saved) {
      reset(defaultValues);
      onClose();
    }
  };

  return (
    <Drawer
      title={isEditing ? t('students.drawer.editTitle') : t('students.drawer.title')}
      width={720}
      onClose={onClose}
      open={open}
      styles={{ body: { paddingBottom: 80 } }}
      footer={<StudentDrawerFooter onClose={onClose} />}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {studentFormRows.map((row, rowIndex) => (
          <Row gutter={16} key={rowIndex}>
            {row.map((field) => (
              <Col span={field.span} key={field.name}>
                <StudentFormField field={field} control={control} errors={errors} />
              </Col>
            ))}
          </Row>
        ))}
        <Row>
          <Col span={12}>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {isEditing ? t('students.drawer.editSubmit') : t('students.drawer.submit')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Row>{isSubmitting && <Spin indicator={antIcon} />}</Row>
      </form>
    </Drawer>
  );
}

export default StudentDrawerForm;
