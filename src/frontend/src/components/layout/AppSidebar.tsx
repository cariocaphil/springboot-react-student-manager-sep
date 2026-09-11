import { useState } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Sider } = Layout;

function AppSidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems: MenuProps['items'] = [
    {
      key: 'students',
      icon: <UserOutlined />,
      label: t('layout.menu.students'),
    },
  ];

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <div className="logo" />
      <Menu theme="dark" defaultSelectedKeys={['students']} mode="inline" items={menuItems} />
    </Sider>
  );
}

export default AppSidebar;
