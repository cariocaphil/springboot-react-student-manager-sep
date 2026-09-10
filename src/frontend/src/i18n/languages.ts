export const AppLanguageCode = {
  En: 'en',
  De: 'de',
} as const;

export type AppLanguage = (typeof AppLanguageCode)[keyof typeof AppLanguageCode];

export const SUPPORTED_LANGUAGES = [AppLanguageCode.En, AppLanguageCode.De] as const;

export const DEFAULT_LANGUAGE: AppLanguage = AppLanguageCode.En;

export function resolveAppLanguage(language: string | undefined): AppLanguage {
  if (language?.toLowerCase().startsWith(AppLanguageCode.De)) {
    return AppLanguageCode.De;
  }
  return AppLanguageCode.En;
}
