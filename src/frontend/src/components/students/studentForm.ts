import type { Gender, NewStudent } from '../../types/student';

export function createNewStudentFromForm(values: {
  name: string;
  email: string;
  gender: Gender | undefined;
}): NewStudent | undefined {
  if (values.gender === undefined) {
    return undefined;
  }
  return {
    name: values.name,
    email: values.email,
    gender: values.gender,
  };
}
