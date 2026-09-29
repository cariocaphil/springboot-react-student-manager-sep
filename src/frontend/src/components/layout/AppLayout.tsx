import type { ReactNode } from 'react';
import { Button, Breadcrumb, Layout } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import AppFooter from './AppFooter';
import AppSidebar from './AppSidebar';
import LanguageSwitcher from './LanguageSwitcher';

const { Header, Content } = Layout;

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar />
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          <LanguageSwitcher />
          <Button
            icon={<LogoutOutlined />}
            onClick={logout}
            aria-label={t('layout.logout')}
          >
            {t('layout.logout')}
          </Button>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Breadcrumb
            style={{ marginBottom: 16 }}
            items={[{ title: t('layout.breadcrumbStudents') }]}
          />
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            {children}
          </div>
        </Content>
        <AppFooter />
      </Layout>
    </Layout>
  );
}

export default AppLayout;
