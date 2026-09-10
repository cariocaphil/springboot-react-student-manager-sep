export const SUPPORTED_LANGUAGES = ['en', 'de'] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export function resolveAppLanguage(language: string | undefined): AppLanguage {
  if (language?.toLowerCase().startsWith('de')) {
    return 'de';
  }
  return 'en';
}
