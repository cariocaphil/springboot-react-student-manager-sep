import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { AppLanguageCode, resolveAppLanguage, type AppLanguage } from '../../i18n/languages';

function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const value = resolveAppLanguage(i18n.language);

  return (
    <Select<AppLanguage>
      size="small"
      aria-label={t('language.label')}
      value={value}
      onChange={(language) => {
        void i18n.changeLanguage(language);
      }}
      options={[
        { value: AppLanguageCode.En, label: t('language.en') },
        { value: AppLanguageCode.De, label: t('language.de') },
      ]}
      style={{ width: 72 }}
    />
  );
}

export default LanguageSwitcher;
