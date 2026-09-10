import type { ReactNode } from 'react';
import { Breadcrumb, Layout } from 'antd';
import { useTranslation } from 'react-i18next';
import AppFooter from './AppFooter';
import AppSidebar from './AppSidebar';

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
        <Header className="site-layout-background" style={{ padding: 0 }} />
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb
            style={{ margin: '16px 0' }}
            items={[
              { title: t('layout.breadcrumbUser') },
              { title: t('layout.breadcrumbBill') },
            ]}
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
