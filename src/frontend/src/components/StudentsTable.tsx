import { Badge, Button, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Student } from '../types';
import { buildColumns } from './studentColumns';

export function AddStudentButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      type="primary"
      shape="round"
      icon={<PlusOutlined />}
      size="small"
    >
      Add New Student
    </Button>
  );
}

interface StudentsTableProps {
  students: Student[];
  onDelete: (studentId: number) => void;
  onAddClick: () => void;
}

function StudentsTable({ students, onDelete, onAddClick }: StudentsTableProps) {
  return (
    <Table
      dataSource={students}
      columns={buildColumns(onDelete)}
      bordered
      title={() => (
        <>
          <Tag>Number of students</Tag>
          <Badge count={students.length} className="site-badge-count-4" />
          <br />
          <br />
          <AddStudentButton onClick={onAddClick} />
        </>
      )}
      pagination={{ pageSize: 50 }}
      scroll={{ y: 240 }}
      rowKey={(student) => student.id}
    />
  );
}

export default StudentsTable;
