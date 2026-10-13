import { describe, expect, it, vi } from 'vitest';
import type { CourseFormFieldConfig } from './courseFormFields';
import { renderCourseFieldControl } from './renderCourseFieldControl';

describe('renderCourseFieldControl', () => {
  it('throws on an unsupported field type', () => {
    const rhfField = {
      name: 'title' as const,
      value: '',
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    };

    expect(() =>
      renderCourseFieldControl(
        { type: 'unsupported' } as unknown as CourseFormFieldConfig,
        rhfField,
        'ph'
      )
    ).toThrow(/Unsupported field type/);
  });
});
