import { describe, expect, it } from 'vitest';
import { courseFormSchema, courseToFormValues, createNewCourseFromForm } from './courseForm';

function failures(input: unknown) {
  const result = courseFormSchema.safeParse(input);
  expect(result.success).toBe(false);
  return result.success ? [] : result.error.issues.map((i) => `${String(i.path[0])}:${i.code}`);
}

describe('courseFormSchema (constraints)', () => {
  it('accepts a valid course with an empty description', () => {
    const result = courseFormSchema.safeParse({
      title: 'Algorithms',
      description: '',
      capacity: 30,
    });
    expect(result.success).toBe(true);
  });

  it('trims the title', () => {
    const result = courseFormSchema.safeParse({
      title: '  Algorithms  ',
      description: '',
      capacity: 1,
    });
    expect(result.success && result.data.title).toBe('Algorithms');
  });

  it('rejects a blank title', () => {
    expect(failures({ title: '   ', description: '', capacity: 5 })).toEqual(['title:too_small']);
  });

  it('rejects capacity below the minimum', () => {
    expect(failures({ title: 'A', description: '', capacity: 0 })).toEqual(['capacity:too_small']);
  });

  it('rejects non-integer capacity', () => {
    expect(failures({ title: 'A', description: '', capacity: 1.5 })).toEqual([
      'capacity:invalid_type',
    ]);
  });

  it('rejects missing capacity', () => {
    expect(failures({ title: 'A', description: '' })).toEqual(['capacity:invalid_type']);
  });
});

describe('course form mappers', () => {
  it('omits an empty description and trims text on submit', () => {
    expect(
      createNewCourseFromForm({ title: ' Algebra ', description: '  ', capacity: 20 })
    ).toEqual({ title: 'Algebra', capacity: 20 });
    expect(
      createNewCourseFromForm({ title: 'Algebra', description: ' Intro ', capacity: 20 })
    ).toEqual({ title: 'Algebra', description: 'Intro', capacity: 20 });
  });

  it('maps a missing description to an empty form string', () => {
    expect(courseToFormValues({ id: 1, title: 'Algebra', capacity: 20 })).toEqual({
      title: 'Algebra',
      description: '',
      capacity: 20,
    });
  });
});
