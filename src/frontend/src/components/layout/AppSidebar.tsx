import { useState } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems: MenuProps['items'] = [
  { key: '1', icon: <PieChartOutlined />, label: 'Option 1' },
  { key: '2', icon: <DesktopOutlined />, label: 'Option 2' },
  {
    key: 'sub1',
    icon: <UserOutlined />,
    label: 'User',
    children: [
      { key: '3', label: 'Tom' },
      { key: '4', label: 'Bill' },
      { key: '5', label: 'Alex' },
    ],
  },
  {
    key: 'sub2',
    icon: <TeamOutlined />,
    label: 'Team',
    children: [
      { key: '6', label: 'Team 1' },
      { key: '8', label: 'Team 2' },
    ],
  },
  { key: '9', icon: <FileOutlined />, label: 'Files' },
];

function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <div className="logo" />
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={menuItems} />
    </Sider>
  );
}

export default AppSidebar;
