import type { ReactNode } from 'react';
import { Breadcrumb, Layout } from 'antd';
import { useTranslation } from 'react-i18next';
import AppFooter from './AppFooter';
import AppSidebar from './AppSidebar';
import LanguageSwitcher from './LanguageSwitcher';

const { Header, Content } = Layout;

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const { t } = useTranslation();

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
          }}
        >
          <LanguageSwitcher />
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
