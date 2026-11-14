import { zodResolver } from '@hookform/resolvers/zod';
import type { ResolverOptions } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { courseFormSchema, createCourseFormErrorMap, type CourseFormValues } from './courseForm';

const options = {
  fields: {},
  shouldUseNativeValidation: false,
  criteriaMode: 'firstError',
  names: [],
} as unknown as ResolverOptions<CourseFormValues>;

/** Runs the same resolver the drawer uses (async mode, `error` option passed through to Zod). */
async function validate(language: string, values: Record<string, unknown>) {
  const resolver = zodResolver(courseFormSchema, { error: createCourseFormErrorMap(language) });
  const { errors } = await resolver(values as unknown as CourseFormValues, undefined, options);
  return { title: errors.title?.message, capacity: errors.capacity?.message };
}

const valid = { title: 'Algorithms', description: '', capacity: 30 };

describe('course form resolver messages', () => {
  it('localizes a blank title as required', async () => {
    const result = await validate('en', { ...valid, title: '   ' });
    expect(result.title).toBe(i18n.getFixedT('en')('courses.validation.titleRequired'));
  });

  it('localizes capacity below the minimum', async () => {
    const result = await validate('en', { ...valid, capacity: 0 });
    expect(result.capacity).toBe(i18n.getFixedT('en')('courses.validation.capacityMin'));
  });

  it('localizes non-integer capacity', async () => {
    const result = await validate('en', { ...valid, capacity: 1.5 });
    expect(result.capacity).toBe(i18n.getFixedT('en')('courses.validation.capacityInteger'));
  });

  it('localizes missing capacity as required', async () => {
    const result = await validate('en', { title: 'Algorithms', description: '' });
    expect(result.capacity).toBe(i18n.getFixedT('en')('courses.validation.capacityRequired'));
  });

  it('localizes in German', async () => {
    const de = i18n.getFixedT('de');
    const result = await validate('de', { title: '', description: '', capacity: 0 });
    expect(result).toEqual({
      title: de('courses.validation.titleRequired'),
      capacity: de('courses.validation.capacityMin'),
    });
    expect(result.capacity).not.toBe(i18n.getFixedT('en')('courses.validation.capacityMin'));
  });

  it('keeps Zod default text for an unmapped title issue (wrong type), not "required"', async () => {
    const result = await validate('en', { ...valid, title: 123 });
    expect(result.title).toMatch(/expected string/i);
    expect(result.title).not.toBe(i18n.getFixedT('en')('courses.validation.titleRequired'));
  });
});
