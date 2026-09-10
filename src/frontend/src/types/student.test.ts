import { describe, expect, it } from 'vitest';
import type { components } from './generated/schema';
import { GENDERS } from './student';
import type { Gender, NewStudent, Student } from './student';

describe('student types', () => {
  it('exposes gender options that match the OpenAPI contract', () => {
    expect(GENDERS).toEqual(['MALE', 'FEMALE', 'OTHER']);
    const sample: Gender = GENDERS[0];
    expect(sample).toBe('MALE');

    type ContractGender = components['schemas']['StudentRequest']['gender'];
    const contractValues: ContractGender[] = ['MALE', 'FEMALE', 'OTHER'];
    expect([...GENDERS]).toEqual(contractValues);
  });

  it('aliases Student / NewStudent to generated OpenAPI schemas', () => {
    const student: Student = {
      id: 1,
      name: 'Ada',
      email: 'ada@example.com',
      gender: 'FEMALE',
    };
    const create: NewStudent = {
      name: student.name,
      email: student.email,
      gender: student.gender,
    };
    expect(create.gender).toBe('FEMALE');
  });
});
