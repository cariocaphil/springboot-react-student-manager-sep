import { Drawer, Input, Col, Select, Form, Row, Button, Spin } from 'antd';
import type { ValidateErrorEntity } from 'rc-field-form/es/interface';
import { LoadingOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { NewStudent } from '../../types/student';
import StudentDrawerFooter from './StudentDrawerFooter';

const { Option } = Select;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

interface StudentDrawerFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (student: NewStudent) => Promise<boolean>;
}

function StudentDrawerForm({ open, onClose, onCreate }: StudentDrawerFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const onFinish = (student: NewStudent) => {
    setSubmitting(true);
    void onCreate(student)
      .then((created) => {
        if (created) {
          onClose();
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const onFinishFailed = (errorInfo: ValidateErrorEntity<NewStudent>) => {
    alert(JSON.stringify(errorInfo, null, 2));
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
      <Form
        layout="vertical"
        onFinishFailed={onFinishFailed}
        onFinish={onFinish}
        hideRequiredMark
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter student name' }]}
            >
              <Input placeholder="Please enter student name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Please enter student email' }]}
            >
              <Input placeholder="Please enter student email" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="gender"
              rules={[{ required: true, message: 'Please select a gender' }]}
            >
              <Select placeholder="Please select a gender">
                <Option value="MALE">MALE</Option>
                <Option value="FEMALE">FEMALE</Option>
                <Option value="OTHER">OTHER</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Row>{submitting && <Spin indicator={antIcon} />}</Row>
      </Form>
    </Drawer>
  );
}

export default StudentDrawerForm;
