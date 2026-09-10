import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import deDE from 'antd/locale/de_DE';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveAppLanguage } from '../../i18n/languages';

interface AppProvidersProps {
  children: ReactNode;
}

function AppProviders({ children }: AppProvidersProps) {
  const { i18n } = useTranslation();
  const language = resolveAppLanguage(i18n.language);
  const locale = language === 'de' ? deDE : enUS;

  return <ConfigProvider locale={locale}>{children}</ConfigProvider>;
}

export default AppProviders;
