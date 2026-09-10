import { Drawer, Col, Form, Row, Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NewStudent } from '../../types/student';
import {
  createNewStudentFromForm,
  defaultValues,
  studentFormSchema,
  type StudentFormValues,
} from './studentForm';
import {
  groupStudentFormFieldsIntoRows,
  studentFormFields,
} from './studentFormFields';
import StudentDrawerFooter from './StudentDrawerFooter';
import StudentFormField from './StudentFormField';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const studentFormRows = groupStudentFormFieldsIntoRows(studentFormFields);

interface StudentDrawerFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (student: NewStudent) => Promise<boolean>;
}

function StudentDrawerForm({ open, onClose, onCreate }: StudentDrawerFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
    }
  }, [open]);

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
      title="Create new student"
      width={720}
      onClose={onClose}
      visible={open}
      bodyStyle={{ paddingBottom: 80 }}
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
                Submit
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
