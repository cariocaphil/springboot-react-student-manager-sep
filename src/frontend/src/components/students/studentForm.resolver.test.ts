import { zodResolver } from '@hookform/resolvers/zod';
import type { ResolverOptions } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import {
  createStudentFormErrorMap,
  studentFormSchema,
  type StudentFormValues,
} from './studentForm';

const options = {
  fields: {},
  shouldUseNativeValidation: false,
  criteriaMode: 'firstError',
  names: [],
} as unknown as ResolverOptions<StudentFormValues>;

/** Runs the same resolver the drawer uses (async mode, `error` option passed through to Zod). */
async function validate(language: string, values: Record<string, unknown>) {
  const resolver = zodResolver(studentFormSchema, { error: createStudentFormErrorMap(language) });
  const { errors } = await resolver(values as unknown as StudentFormValues, undefined, options);
  return {
    name: errors.name?.message,
    email: errors.email?.message,
    gender: errors.gender?.message,
  };
}

describe('student form resolver messages', () => {
  it('localizes required messages (en)', async () => {
    const t = i18n.getFixedT('en');
    expect(await validate('en', { name: '', email: '', gender: undefined })).toEqual({
      name: t('students.validation.nameRequired'),
      email: t('students.validation.emailRequired'),
      gender: t('students.validation.genderRequired'),
    });
  });

  it('localizes required messages (de)', async () => {
    const de = i18n.getFixedT('de');
    const result = await validate('de', { name: '', email: '', gender: undefined });
    expect(result).toEqual({
      name: de('students.validation.nameRequired'),
      email: de('students.validation.emailRequired'),
      gender: de('students.validation.genderRequired'),
    });
    expect(result.name).not.toBe(i18n.getFixedT('en')('students.validation.nameRequired'));
  });

  it('reports a missing email as required', async () => {
    const result = await validate('en', { name: 'Ada', gender: 'FEMALE' });
    expect(result.email).toBe(i18n.getFixedT('en')('students.validation.emailRequired'));
  });

  it('reports an omitted gender as required', async () => {
    const result = await validate('en', { name: 'Ada', email: 'ada@example.com' });
    expect(result.gender).toBe(i18n.getFixedT('en')('students.validation.genderRequired'));
  });

  it('reports a malformed email as invalid, not required', async () => {
    const result = await validate('en', { name: 'Ada', email: 'not-an-email', gender: 'FEMALE' });
    expect(result.email).toBe(i18n.getFixedT('en')('students.validation.emailInvalid'));
  });

  it('keeps Zod default text for unmapped issues', async () => {
    const result = await validate('en', { name: 123, email: 'ada@example.com', gender: 'FEMALE' });
    expect(result.name).toMatch(/expected string/i);
  });

  it('does not localize without the error option', async () => {
    const resolver = zodResolver(studentFormSchema);
    const { errors } = await resolver(
      { name: '', email: 'ada@example.com', gender: 'FEMALE' },
      undefined,
      options
    );
    expect(errors.name?.message).not.toBe(i18n.getFixedT('en')('students.validation.nameRequired'));
  });
});
