import { GENDERS } from '../../types/student';
import type { StudentFormValues } from './studentForm';

type StudentFormFieldBase = {
  name: keyof StudentFormValues;
  label: string;
  placeholder: string;
  /** Ant Design Col span (24-grid). */
  span: number;
};

export type TextStudentFormField = StudentFormFieldBase & {
  type: 'text';
};

export type SelectStudentFormField = StudentFormFieldBase & {
  type: 'select';
  options: readonly string[];
};

export type StudentFormFieldConfig = TextStudentFormField | SelectStudentFormField;

export const studentFormFields: StudentFormFieldConfig[] = [
  {
    name: 'name',
    type: 'text',
    label: 'Name',
    placeholder: 'Please enter student name',
    span: 12,
  },
  {
    name: 'email',
    type: 'text',
    label: 'Email',
    placeholder: 'Please enter student email',
    span: 12,
  },
  {
    name: 'gender',
    type: 'select',
    label: 'gender',
    placeholder: 'Please select a gender',
    span: 12,
    options: GENDERS,
  },
];

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
