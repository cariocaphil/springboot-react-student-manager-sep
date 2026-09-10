import type { Gender, NewStudent } from '../../types/student';

export interface StudentFormValues {
  name: string;
  email: string;
  gender: Gender | undefined;
}

export const defaultValues: StudentFormValues = {
  name: '',
  email: '',
  gender: undefined,
};

export function createNewStudentFromForm(
  values: StudentFormValues
): NewStudent | undefined {
  if (values.gender === undefined) {
    return undefined;
  }
  return {
    name: values.name,
    email: values.email,
    gender: values.gender,
  };
}
