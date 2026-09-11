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
      <div
        style={{
          height: 64,
          margin: collapsed ? '16px 8px' : 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: '#fff',
          borderRadius: 6,
        }}
      >
        <img
          src="/logo.png"
          alt="SEP"
          style={{
            maxHeight: collapsed ? 36 : 52,
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      <Menu theme="dark" defaultSelectedKeys={['students']} mode="inline" items={menuItems} />
    </Sider>
  );
}

export default AppSidebar;
