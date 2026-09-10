import type { TFunction } from 'i18next';
import { GENDERS } from '../../types/student';
import type { StudentFormValues } from './studentForm';

export const FieldType = {
  Text: 'text',
  Select: 'select',
} as const;

export type FieldType = (typeof FieldType)[keyof typeof FieldType];

type StudentFormFieldBase = {
  name: keyof StudentFormValues;
  label: string;
  placeholder: string;
  /** Ant Design Col span (24-grid). */
  span: number;
  /** Shows Ant Design required marker; Zod remains validation source of truth. */
  required: boolean;
};

export type TextStudentFormField = StudentFormFieldBase & {
  type: typeof FieldType.Text;
};

export type SelectStudentFormField = StudentFormFieldBase & {
  type: typeof FieldType.Select;
  options: readonly string[];
};

export type StudentFormFieldConfig = TextStudentFormField | SelectStudentFormField;

export function getStudentFormFields(t: TFunction): StudentFormFieldConfig[] {
  return [
    {
      name: 'name',
      type: FieldType.Text,
      label: t('students.form.name.label'),
      placeholder: t('students.form.name.placeholder'),
      span: 12,
      required: true,
    },
    {
      name: 'email',
      type: FieldType.Text,
      label: t('students.form.email.label'),
      placeholder: t('students.form.email.placeholder'),
      span: 12,
      required: true,
    },
    {
      name: 'gender',
      type: FieldType.Select,
      label: t('students.form.gender.label'),
      placeholder: t('students.form.gender.placeholder'),
      span: 12,
      required: true,
      options: GENDERS,
    },
  ];
}

/** Pack fields into Ant Design rows using a 24-column grid. */
export function groupStudentFormFieldsIntoRows(
  fields: StudentFormFieldConfig[]
): StudentFormFieldConfig[][] {
  const rows: StudentFormFieldConfig[][] = [];
  let currentRow: StudentFormFieldConfig[] = [];
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
