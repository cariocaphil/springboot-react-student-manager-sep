import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Student } from '../../types/student';
import StudentsView from './StudentsView';

const authState = {
  isAuthenticated: true,
  user: { username: 'dev', role: 'ADMIN' as const },
  canManageStudents: true,
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => authState,
}));

const studentsHook = {
  students: [] as Student[],
  isLoading: false,
  isError: false,
  isFetching: false,
  retryLoad: vi.fn(),
  createStudent: vi.fn(),
  removeStudentById: vi.fn(),
};

vi.mock('../../hooks/useStudents', () => ({
  useStudents: () => studentsHook,
}));

const students: Student[] = [
  {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    gender: 'FEMALE',
  },
];

describe('StudentsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { username: 'dev', role: 'ADMIN' };
    authState.canManageStudents = true;
    studentsHook.students = [];
    studentsHook.isLoading = false;
    studentsHook.isError = false;
  });

  it('shows add control for ADMIN when the list is empty', () => {
    render(<StudentsView />);

    expect(screen.getByRole('button', { name: /Add New Student/i })).toBeInTheDocument();
  });

  it('hides add control for USER when the list is empty', () => {
    authState.user = { username: 'reader', role: 'USER' };
    authState.canManageStudents = false;

    render(<StudentsView />);

    expect(screen.queryByRole('button', { name: /Add New Student/i })).not.toBeInTheDocument();
  });

  it('shows delete for ADMIN and hides write controls for USER when students exist', () => {
    studentsHook.students = students;

    const { unmount } = render(<StudentsView />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add New Student/i })).toBeInTheDocument();
    unmount();

    authState.user = { username: 'reader', role: 'USER' };
    authState.canManageStudents = false;
    render(<StudentsView />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add New Student/i })).not.toBeInTheDocument();
  });
});
