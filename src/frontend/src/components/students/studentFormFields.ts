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
};

export type TextStudentFormField = StudentFormFieldBase & {
  type: typeof FieldType.Text;
};

export type SelectStudentFormField = StudentFormFieldBase & {
  type: typeof FieldType.Select;
  options: readonly string[];
};

export type StudentFormFieldConfig = TextStudentFormField | SelectStudentFormField;

export const studentFormFields: StudentFormFieldConfig[] = [
  {
    name: 'name',
    type: FieldType.Text,
    label: 'Name',
    placeholder: 'Please enter student name',
    span: 12,
  },
  {
    name: 'email',
    type: FieldType.Text,
    label: 'Email',
    placeholder: 'Please enter student email',
    span: 12,
  },
  {
    name: 'gender',
    type: FieldType.Select,
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
