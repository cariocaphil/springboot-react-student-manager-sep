import { z } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import i18n from '../../i18n';

/** Build schema with messages for the given language (pass `i18n.language` so callers rebuild on change). */
export function createLoginFormSchema(language: string = i18n.language) {
  const t = i18n.getFixedT(language);
  return z.object({
    username: z.string().min(1, t('login.validation.usernameRequired')),
    password: z.string().min(1, t('login.validation.passwordRequired')),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginFormSchema>>;

export const loginDefaultValues: DefaultValues<LoginFormValues> = {
  username: '',
  password: '',
};
