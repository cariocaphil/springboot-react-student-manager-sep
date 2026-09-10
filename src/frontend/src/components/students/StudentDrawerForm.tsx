import { Drawer, Col, Form, Row, Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import type { NewStudent } from '../../types/student';
import {
  createNewStudentFromForm,
  createStudentFormSchema,
  defaultValues,
  type StudentFormValues,
} from './studentForm';
import { getStudentFormFields, groupStudentFormFieldsIntoRows } from './studentFormFields';
import StudentDrawerFooter from './StudentDrawerFooter';
import StudentFormField from './StudentFormField';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

interface StudentDrawerFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (student: NewStudent) => Promise<boolean>;
}

function StudentDrawerForm({ open, onClose, onCreate }: StudentDrawerFormProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createStudentFormSchema(t), [t]);
  const studentFormRows = useMemo(
    () => groupStudentFormFieldsIntoRows(getStudentFormFields(t)),
    [t]
  );

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
    }
  }, [open, reset]);

  const onSubmit = async (values: StudentFormValues) => {
    const student = createNewStudentFromForm(values);
    const created = await onCreate(student);
    if (created) {
      reset(defaultValues);
      onClose();
    }
  };

  return (
    <Drawer
      title={t('students.drawer.title')}
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
                {t('students.drawer.submit')}
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
