import { describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import {
  FieldType,
  getStudentFormFields,
  groupStudentFormFieldsIntoRows,
} from './studentFormFields';

describe('studentFormFields', () => {
  const studentFormFields = getStudentFormFields(i18n.t.bind(i18n));

  it('defines text and select fields for name, email, and gender', () => {
    expect(studentFormFields.map((field) => field.name)).toEqual(['name', 'email', 'gender']);
    expect(studentFormFields[0]?.type).toBe(FieldType.Text);
    expect(studentFormFields[1]?.type).toBe(FieldType.Text);
    expect(studentFormFields[2]?.type).toBe(FieldType.Select);
    expect(studentFormFields.every((field) => field.required)).toBe(true);
    if (studentFormFields[2]?.type === FieldType.Select) {
      expect(studentFormFields[2].options).toEqual(['MALE', 'FEMALE', 'OTHER']);
    }
  });

  it('groups name/email on one row and gender on the next', () => {
    const rows = groupStudentFormFieldsIntoRows(studentFormFields);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.map((field) => field.name)).toEqual(['name', 'email']);
    expect(rows[1]?.map((field) => field.name)).toEqual(['gender']);
  });
});
