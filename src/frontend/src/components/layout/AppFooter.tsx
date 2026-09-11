import { Layout } from 'antd';
import { useTranslation } from 'react-i18next';

const { Footer } = Layout;

/** Source repository for this project (not a third-party course). */
export const REPO_SOURCE_URL =
  'https://github.com/cariocaphil/springboot-react-student-manager-sep';

function AppFooter() {
  const { t } = useTranslation();

  return (
    <Footer style={{ textAlign: 'center', padding: '16px 24px' }}>
      <div style={{ marginBottom: 8 }}>{t('layout.tagline')}</div>
      <a rel="noopener noreferrer" target="_blank" href={REPO_SOURCE_URL}>
        {t('layout.sourceLink')}
      </a>
    </Footer>
  );
}

export default AppFooter;
