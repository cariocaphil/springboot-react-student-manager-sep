import { Button } from 'antd';

interface StudentDrawerFooterProps {
  onClose: () => void;
}

function StudentDrawerFooter({ onClose }: StudentDrawerFooterProps) {
  return (
    <div
      style={{
        textAlign: 'right',
      }}
    >
      <Button onClick={onClose} style={{ marginRight: 8 }}>
        Cancel
      </Button>
    </div>
  );
}

export default StudentDrawerFooter;
