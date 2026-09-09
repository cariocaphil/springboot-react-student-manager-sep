export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

export type Gender = (typeof GENDERS)[number];

export interface Student {
  id: number;
  name: string;
  email: string;
  gender: Gender;
}

export type NewStudent = Omit<Student, 'id'>;
