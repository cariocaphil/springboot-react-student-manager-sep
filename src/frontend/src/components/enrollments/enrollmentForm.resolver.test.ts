import { zodResolver } from '@hookform/resolvers/zod';
import type { ResolverOptions } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import {
  createEnrollmentFormErrorMap,
  enrollmentFormSchema,
  type EnrollmentFormValues,
} from './enrollmentForm';

const options = {
  fields: {},
  shouldUseNativeValidation: false,
  criteriaMode: 'firstError',
  names: [],
} as unknown as ResolverOptions<EnrollmentFormValues>;

/** Runs the same resolver the drawer uses (async mode, `error` option passed through to Zod). */
async function validate(language: string, values: Record<string, unknown>) {
  const resolver = zodResolver(enrollmentFormSchema, {
    error: createEnrollmentFormErrorMap(language),
  });
  const { errors } = await resolver(values as unknown as EnrollmentFormValues, undefined, options);
  return { studentId: errors.studentId?.message, courseId: errors.courseId?.message };
}

describe('enrollment form resolver messages', () => {
  it('localizes missing ids (en)', async () => {
    const t = i18n.getFixedT('en');
    expect(await validate('en', {})).toEqual({
      studentId: t('enrollments.validation.studentRequired'),
      courseId: t('enrollments.validation.courseRequired'),
    });
  });

  it('localizes missing ids (de)', async () => {
    const de = i18n.getFixedT('de');
    const result = await validate('de', {});
    expect(result).toEqual({
      studentId: de('enrollments.validation.studentRequired'),
      courseId: de('enrollments.validation.courseRequired'),
    });
    expect(result.studentId).not.toBe(
      i18n.getFixedT('en')('enrollments.validation.studentRequired')
    );
  });

  it('keeps Zod default text for an unmapped issue (fractional id), not "required"', async () => {
    const result = await validate('en', { studentId: 1.5, courseId: 2 });
    expect(result.studentId).toBeTruthy();
    expect(result.studentId).not.toBe(
      i18n.getFixedT('en')('enrollments.validation.studentRequired')
    );
    expect(result.courseId).toBeUndefined();
  });
});
