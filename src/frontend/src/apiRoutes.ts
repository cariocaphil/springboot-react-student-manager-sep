export const studentsApi = {
  collection: 'api/v1/students',
  byId: (studentId: number) => `api/v1/students/${studentId}`,
} as const;

export const coursesApi = {
  collection: 'api/v1/courses',
  byId: (courseId: number) => `api/v1/courses/${courseId}`,
} as const;

export const meApi = {
  current: 'api/v1/me',
} as const;
