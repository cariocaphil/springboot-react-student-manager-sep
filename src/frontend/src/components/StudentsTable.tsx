import { Badge, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { Student } from '../types/student';
import { useStudentColumns } from './students/studentColumns';
import AddStudentButton from './students/AddStudentButton';

interface StudentsTableProps {
  students: Student[];
  onDelete: (studentId: number) => void;
  onAddClick: () => void;
}

function StudentsTable({ students, onDelete, onAddClick }: StudentsTableProps) {
  const { t } = useTranslation();
  const columns = useStudentColumns(onDelete);

  return (
    <Table
      dataSource={students}
      columns={columns}
      bordered
      title={() => (
        <>
          <Tag>{t('students.countTag')}</Tag>
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
