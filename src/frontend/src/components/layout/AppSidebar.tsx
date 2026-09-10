import { useMemo, useState } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Sider } = Layout;

function AppSidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems: MenuProps['items'] = useMemo(
    () => [
      { key: '1', icon: <PieChartOutlined />, label: t('layout.menu.option1') },
      { key: '2', icon: <DesktopOutlined />, label: t('layout.menu.option2') },
      {
        key: 'sub1',
        icon: <UserOutlined />,
        label: t('layout.menu.user'),
        children: [
          { key: '3', label: t('layout.menu.tom') },
          { key: '4', label: t('layout.menu.bill') },
          { key: '5', label: t('layout.menu.alex') },
        ],
      },
      {
        key: 'sub2',
        icon: <TeamOutlined />,
        label: t('layout.menu.team'),
        children: [
          { key: '6', label: t('layout.menu.team1') },
          { key: '8', label: t('layout.menu.team2') },
        ],
      },
      { key: '9', icon: <FileOutlined />, label: t('layout.menu.files') },
    ],
    [t]
  );

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <div className="logo" />
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={menuItems} />
    </Sider>
  );
}

export default AppSidebar;
