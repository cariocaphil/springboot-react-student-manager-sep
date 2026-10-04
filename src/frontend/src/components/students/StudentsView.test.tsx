import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import type { Student } from '../../types/student';
import type { CurrentUser } from '../../types/user';
import StudentsView from './StudentsView';

const authState = {
  isAuthenticated: true,
  user: { username: 'dev', role: 'ADMIN' } as CurrentUser,
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
  updateStudentById: vi.fn(),
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

async function chooseGender(label: string): Promise<void> {
  fireEvent.mouseDown(screen.getByRole('combobox'));
  const option = await screen.findByText(label, {
    selector: '.ant-select-item-option-content',
  });
  fireEvent.click(option);
}

describe('StudentsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { username: 'dev', role: 'ADMIN' };
    authState.canManageStudents = true;
    studentsHook.students = [];
    studentsHook.isLoading = false;
    studentsHook.isError = false;
    studentsHook.isFetching = false;
    studentsHook.createStudent.mockResolvedValue(true);
    studentsHook.updateStudentById.mockResolvedValue(true);
  });

  it('shows a spinner while students are loading', () => {
    studentsHook.isLoading = true;

    const { container } = render(<StudentsView />);

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('shows the load error and retries', async () => {
    const user = userEvent.setup();
    studentsHook.isError = true;

    render(<StudentsView />);

    expect(screen.getByText(i18n.t('students.loadError.title'))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: i18n.t('students.loadError.retry') }));
    expect(studentsHook.retryLoad).toHaveBeenCalled();
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

  it('opens the edit drawer when Edit is clicked', async () => {
    const user = userEvent.setup();
    studentsHook.students = students;

    render(<StudentsView />);

    await user.click(screen.getByText('Edit'));
    expect(await screen.findByText('Edit student')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ada Lovelace')).toBeInTheDocument();
  });

  it('closes the drawer and clears edit state on cancel', async () => {
    const user = userEvent.setup();
    studentsHook.students = students;

    render(<StudentsView />);

    await user.click(screen.getByText('Edit'));
    expect(await screen.findByText('Edit student')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText('Edit student')).not.toBeInTheDocument();
    });
  });

  it('creates a student from the empty-state drawer', async () => {
    const user = userEvent.setup();

    render(<StudentsView />);

    await user.click(screen.getByRole('button', { name: /Add New Student/i }));
    expect(await screen.findByText('Create new student')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Please enter student name'), 'Ada Lovelace');
    await user.type(screen.getByPlaceholderText('Please enter student email'), 'ada@example.com');
    await chooseGender('FEMALE');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(studentsHook.createStudent).toHaveBeenCalledWith({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        gender: 'FEMALE',
      });
    });
    expect(studentsHook.updateStudentById).not.toHaveBeenCalled();
  });

  it('updates a student from the edit drawer', async () => {
    const user = userEvent.setup();
    studentsHook.students = students;

    render(<StudentsView />);

    await user.click(screen.getByText('Edit'));
    expect(await screen.findByText('Edit student')).toBeInTheDocument();

    const nameInput = screen.getByDisplayValue('Ada Lovelace');
    await user.clear(nameInput);
    await user.type(nameInput, 'Ada Updated');
    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    await waitFor(() => {
      expect(studentsHook.updateStudentById).toHaveBeenCalledWith(1, {
        name: 'Ada Updated',
        email: 'ada@example.com',
        gender: 'FEMALE',
      });
    });
    expect(studentsHook.createStudent).not.toHaveBeenCalled();
  });
});
