import { Badge, Table, Tag } from 'antd';
import { Student } from '../types/student';
import { buildColumns } from './students/studentColumns';
import AddStudentButton from './students/AddStudentButton';


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
