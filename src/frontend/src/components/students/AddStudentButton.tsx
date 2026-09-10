import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface AddStudentButtonProps {
  onClick: () => void;
}

function AddStudentButton({ onClick }: AddStudentButtonProps) {
  return (
    <Button onClick={onClick} type="primary" shape="round" icon={<PlusOutlined />} size="small">
      Add New Student
    </Button>
  );
}

export default AddStudentButton;
