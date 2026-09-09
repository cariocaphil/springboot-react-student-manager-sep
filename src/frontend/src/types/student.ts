export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Student {
  id: number;
  name: string;
  email: string;
  gender: Gender;
}

export type NewStudent = Omit<Student, 'id'>;
