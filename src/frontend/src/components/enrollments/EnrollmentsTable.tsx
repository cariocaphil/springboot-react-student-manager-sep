import { Badge, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import AddEnrollmentButton from './AddEnrollmentButton';
import { useEnrollmentColumns } from './enrollmentColumns';
import type { EnrollmentRow } from './joinEnrollmentRows';

interface EnrollmentsTableProps {
  rows: EnrollmentRow[];
  canManageEnrollments: boolean;
  onCancel: (enrollmentId: number) => void;
  onAddClick: () => void;
}

function EnrollmentsTable({
  rows,
  canManageEnrollments,
  onCancel,
  onAddClick,
}: EnrollmentsTableProps) {
  const { t } = useTranslation();
  const columns = useEnrollmentColumns({ canManageEnrollments, onCancel });

  return (
    <Table
      dataSource={rows}
      columns={columns}
      bordered
      title={() => (
        <>
          <Tag>{t('enrollments.countTag')}</Tag>
          <Badge count={rows.length} className="site-badge-count-4" />
          {canManageEnrollments ? (
            <>
              <br />
              <br />
              <AddEnrollmentButton onClick={onAddClick} />
            </>
          ) : null}
        </>
      )}
      pagination={{ pageSize: 50 }}
      scroll={{ y: 240 }}
      rowKey={(row) => row.id}
    />
  );
}

export default EnrollmentsTable;
