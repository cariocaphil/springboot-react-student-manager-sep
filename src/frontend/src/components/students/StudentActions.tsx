import { Popconfirm, Radio } from 'antd';

interface StudentActionsProps {
  studentName: string;
  studentId: number;
  onDelete: (studentId: number) => void;
}

function StudentActions({ studentName, studentId, onDelete }: StudentActionsProps) {
  return (
    <Radio.Group>
      <Popconfirm
        placement="topRight"
        title={`Are you sure to delete ${studentName}`}
        onConfirm={() => {
          void onDelete(studentId);
        }}
        okText="Yes"
        cancelText="No"
      >
        <Radio.Button value="small">Delete</Radio.Button>
      </Popconfirm>
      <Radio.Button value="small">Edit</Radio.Button>
    </Radio.Group>
  );
}

export default StudentActions;
