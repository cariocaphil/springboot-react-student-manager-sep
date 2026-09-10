import type { ReactNode } from 'react';
import { Empty, Space, Typography } from 'antd';

interface ErrorStateProps {
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}

function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <Empty
      description={
        <Space direction="vertical" size="small">
          <Typography.Text strong>{title}</Typography.Text>
          <Typography.Text type="secondary">{description}</Typography.Text>
        </Space>
      }
    >
      {action}
    </Empty>
  );
}

export default ErrorState;
