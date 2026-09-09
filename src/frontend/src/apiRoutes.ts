export const studentsApi = {
  collection: 'api/v1/students',
  byId: (studentId: number) => `api/v1/students/${studentId}`,
} as const;
