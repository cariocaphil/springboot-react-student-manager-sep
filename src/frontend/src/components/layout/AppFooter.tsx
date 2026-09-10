import { Divider, Layout } from 'antd';
import { useTranslation } from 'react-i18next';

const { Footer } = Layout;

function AppFooter() {
  const { t } = useTranslation();

  return (
    <>
      <Footer style={{ textAlign: 'center' }}>{t('layout.footerBy')}</Footer>
      <Divider>
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="https://amigoscode.com/p/full-stack-spring-boot-react"
        >
          {t('layout.footerCourseLink')}
        </a>
      </Divider>
    </>
  );
}

export default AppFooter;
