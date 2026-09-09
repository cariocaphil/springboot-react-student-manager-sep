import { Empty } from 'antd';
import { AddStudentButton } from './StudentsTable';

interface EmptyStudentsProps {
  onAddClick: () => void;
}

function EmptyStudents({ onAddClick }: EmptyStudentsProps) {
  return (
    <>
      <AddStudentButton onClick={onAddClick} />
      <Empty />
    </>
  );
}

export default EmptyStudents;
