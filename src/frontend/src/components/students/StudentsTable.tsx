import { Badge, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Student } from '../../types/student';
import AddStudentButton from './AddStudentButton';
import { useStudentColumns } from './studentColumns';

interface StudentsTableProps {
  students: Student[];
  canManageStudents: boolean;
  onDelete: (studentId: number) => void;
  onAddClick: () => void;
}

function StudentsTable({
  students,
  canManageStudents,
  onDelete,
  onAddClick,
}: StudentsTableProps) {
  const { t } = useTranslation();
  const columns = useStudentColumns({ canManageStudents, onDelete });

  return (
    <Table
      dataSource={students}
      columns={columns}
      bordered
      title={() => (
        <>
          <Tag>{t('students.countTag')}</Tag>
          <Badge count={students.length} className="site-badge-count-4" />
          {canManageStudents ? (
            <>
              <br />
              <br />
              <AddStudentButton onClick={onAddClick} />
            </>
          ) : null}
        </>
      )}
      pagination={{ pageSize: 50 }}
      scroll={{ y: 240 }}
      rowKey={(student) => student.id}
    />
  );
}

export default StudentsTable;
