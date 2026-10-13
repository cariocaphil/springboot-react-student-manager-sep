import { useState } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { BookOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { AppView } from '../../App';

const { Sider } = Layout;

interface AppSidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

function AppSidebar({ activeView, onNavigate }: AppSidebarProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems: MenuProps['items'] = [
    {
      key: 'students',
      icon: <UserOutlined />,
      label: t('layout.menu.students'),
    },
    {
      key: 'courses',
      icon: <BookOutlined />,
      label: t('layout.menu.courses'),
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
      <Menu
        theme="dark"
        selectedKeys={[activeView]}
        mode="inline"
        items={menuItems}
        onClick={({ key }) => {
          if (key === 'students' || key === 'courses') {
            onNavigate(key);
          }
        }}
      />
    </Sider>
  );
}

export default AppSidebar;
