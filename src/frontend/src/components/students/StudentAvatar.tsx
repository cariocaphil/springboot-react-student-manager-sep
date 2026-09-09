import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface StudentAvatarProps {
  name: string;
}

function StudentAvatar({ name }: StudentAvatarProps) {
  const trim = name.trim();
  if (trim.length === 0) {
    return <Avatar icon={<UserOutlined />} />;
  }
  const split = trim.split(' ');
  if (split.length === 1) {
    return <Avatar>{name.charAt(0)}</Avatar>;
  }
  return (
    <Avatar>
      {`${name.charAt(0)}${name.charAt(name.length - 1)}`}
    </Avatar>
  );
}

export default StudentAvatar;
