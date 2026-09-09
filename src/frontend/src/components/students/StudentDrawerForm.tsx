import { Drawer, Input, Col, Select, Form, Row, Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { GENDERS, type Gender, type NewStudent } from '../../types/student';
import { EMAIL_INVALID_MESSAGE, EMAIL_PATTERN } from '../../validation/email';
import StudentDrawerFooter from './StudentDrawerFooter';

const { Option } = Select;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

interface StudentFormValues {
  name: string;
  email: string;
  gender: Gender | undefined;
}

const defaultValues: StudentFormValues = {
  name: '',
  email: '',
  gender: undefined,
};

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
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  const onSubmit = async (values: StudentFormValues) => {
    if (!values.gender) {
      return;
    }
    const student: NewStudent = {
      name: values.name,
      email: values.email,
      gender: values.gender,
    };
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
        <Row gutter={16}>
          <Col span={12}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Please enter student name' }}
              render={({ field }) => (
                <Form.Item
                  label="Name"
                  required
                  validateStatus={errors.name ? 'error' : undefined}
                  help={errors.name?.message}
                >
                  <Input {...field} placeholder="Please enter student name" />
                </Form.Item>
              )}
            />
          </Col>
          <Col span={12}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Please enter student email',
                pattern: {
                  value: EMAIL_PATTERN,
                  message: EMAIL_INVALID_MESSAGE,
                },
              }}
              render={({ field }) => (
                <Form.Item
                  label="Email"
                  required
                  validateStatus={errors.email ? 'error' : undefined}
                  help={errors.email?.message}
                >
                  <Input {...field} placeholder="Please enter student email" />
                </Form.Item>
              )}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'Please select a gender' }}
              render={({ field }) => (
                <Form.Item
                  label="gender"
                  required
                  validateStatus={errors.gender ? 'error' : undefined}
                  help={errors.gender?.message}
                >
                  <Select
                    placeholder="Please select a gender"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    {GENDERS.map((gender) => (
                      <Option key={gender} value={gender}>
                        {gender}
                      </Option>
                    ))}
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
