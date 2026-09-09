import { Empty } from 'antd';
import AddStudentButton from './AddStudentButton';

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
