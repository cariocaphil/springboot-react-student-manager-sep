import type { CourseFormValues } from './courseForm';

export const FieldType = {
  Text: 'text',
  TextArea: 'textarea',
  Number: 'number',
} as const;

export type FieldType = (typeof FieldType)[keyof typeof FieldType];

type CourseFormFieldBase = {
  name: keyof CourseFormValues;
  /** i18n key; resolve with `t()` at render time — do not pass `t` into this config. */
  labelKey: string;
  /** i18n key; resolve with `t()` at render time. */
  placeholderKey: string;
  /** Ant Design Col span (24-grid). */
  span: number;
  /** Shows Ant Design required marker; Zod remains validation source of truth. */
  required: boolean;
};

export type TextCourseFormField = CourseFormFieldBase & {
  type: typeof FieldType.Text;
};

export type TextAreaCourseFormField = CourseFormFieldBase & {
  type: typeof FieldType.TextArea;
};

export type NumberCourseFormField = CourseFormFieldBase & {
  type: typeof FieldType.Number;
  min?: number;
};

export type CourseFormFieldConfig =
  TextCourseFormField | TextAreaCourseFormField | NumberCourseFormField;

export const courseFormFields: CourseFormFieldConfig[] = [
  {
    name: 'title',
    type: FieldType.Text,
    labelKey: 'courses.form.title.label',
    placeholderKey: 'courses.form.title.placeholder',
    span: 24,
    required: true,
  },
  {
    name: 'description',
    type: FieldType.TextArea,
    labelKey: 'courses.form.description.label',
    placeholderKey: 'courses.form.description.placeholder',
    span: 24,
    required: false,
  },
  {
    name: 'capacity',
    type: FieldType.Number,
    labelKey: 'courses.form.capacity.label',
    placeholderKey: 'courses.form.capacity.placeholder',
    span: 12,
    required: true,
    min: 1,
  },
];

/** Pack fields into Ant Design rows using a 24-column grid. */
export function groupCourseFormFieldsIntoRows(
  fields: CourseFormFieldConfig[]
): CourseFormFieldConfig[][] {
  const rows: CourseFormFieldConfig[][] = [];
  let currentRow: CourseFormFieldConfig[] = [];
  let usedSpan = 0;

  for (const field of fields) {
    if (usedSpan + field.span > 24 && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
      usedSpan = 0;
    }
    currentRow.push(field);
    usedSpan += field.span;
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}
