import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import type { Course } from '../../types/course';
import type { Enrollment } from '../../types/enrollment';
import type { Student } from '../../types/student';
import type { CurrentUser } from '../../types/user';
import type { EnrollmentRow } from './joinEnrollmentRows';
import EnrollmentsView from './EnrollmentsView';

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

const ada: Student = {
  id: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  gender: 'FEMALE',
};

const algebra: Course = {
  id: 10,
  title: 'Algebra',
  capacity: 30,
};

const enrollment: Enrollment = {
  id: 100,
  studentId: 1,
  courseId: 10,
  enrolledAt: '2026-01-15T10:30:00Z',
};

const row: EnrollmentRow = {
  id: 100,
  studentId: 1,
  courseId: 10,
  enrolledAt: '2026-01-15T10:30:00Z',
  studentName: 'Ada Lovelace',
  courseTitle: 'Algebra',
  capacity: 30,
  enrollmentCount: 1,
  isCourseFull: false,
};

const enrollmentsHook = {
  enrollments: [] as Enrollment[],
  students: [] as Student[],
  courses: [] as Course[],
  rows: [] as EnrollmentRow[],
  isLoading: false,
  isError: false,
  isFetching: false,
  lookupsReady: true,
  retryLoad: vi.fn(),
  createEnrollment: vi.fn(),
  removeEnrollmentById: vi.fn(),
};

vi.mock('../../hooks/useEnrollments', () => ({
  useEnrollments: () => enrollmentsHook,
}));

describe('EnrollmentsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { username: 'dev', role: 'ADMIN' };
    authState.canManageStudents = true;
    enrollmentsHook.enrollments = [];
    enrollmentsHook.students = [ada];
    enrollmentsHook.courses = [algebra];
    enrollmentsHook.rows = [];
    enrollmentsHook.isLoading = false;
    enrollmentsHook.isError = false;
    enrollmentsHook.isFetching = false;
    enrollmentsHook.lookupsReady = true;
    enrollmentsHook.createEnrollment.mockResolvedValue(true);
  });

  it('shows a spinner while enrollments are loading', () => {
    enrollmentsHook.isLoading = true;

    const { container } = render(<EnrollmentsView />);

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('shows the load error and retries', async () => {
    const user = userEvent.setup();
    enrollmentsHook.isError = true;
    enrollmentsHook.lookupsReady = false;

    render(<EnrollmentsView />);

    expect(screen.getByText(i18n.t('enrollments.loadError.title'))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: i18n.t('enrollments.loadError.retry') }));
    expect(enrollmentsHook.retryLoad).toHaveBeenCalled();
  });

  it('shows add control for ADMIN when the list is empty', () => {
    render(<EnrollmentsView />);

    expect(screen.getByRole('button', { name: /Enroll student/i })).toBeInTheDocument();
  });

  it('hides add control for USER when the list is empty', () => {
    authState.user = { username: 'reader', role: 'USER' };
    authState.canManageStudents = false;

    render(<EnrollmentsView />);

    expect(screen.queryByRole('button', { name: /Enroll student/i })).not.toBeInTheDocument();
  });

  it('shows cancel for ADMIN and hides write controls for USER when rows exist', () => {
    enrollmentsHook.enrollments = [enrollment];
    enrollmentsHook.rows = [row];

    const { unmount } = render(<EnrollmentsView />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enroll student/i })).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Algebra')).toBeInTheDocument();
    unmount();

    authState.user = { username: 'reader', role: 'USER' };
    authState.canManageStudents = false;
    render(<EnrollmentsView />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Enroll student/i })).not.toBeInTheDocument();
  });

  it('creates an enrollment from the empty-state drawer', async () => {
    const user = userEvent.setup();

    render(<EnrollmentsView />);

    await user.click(screen.getByRole('button', { name: /Enroll student/i }));
    expect(await screen.findByText('Enroll student in course')).toBeInTheDocument();

    await user.click(screen.getByText('Select a student'));
    await user.click(
      await screen.findByText('Ada Lovelace', { selector: '.ant-select-item-option-content' })
    );
    await user.click(screen.getByText('Select a course'));
    await user.click(
      await screen.findByText('Algebra (0/30)', { selector: '.ant-select-item-option-content' })
    );
    await user.click(screen.getByRole('button', { name: /^Enroll$/i }));

    await waitFor(() => {
      expect(enrollmentsHook.createEnrollment).toHaveBeenCalledWith({
        studentId: 1,
        courseId: 10,
      });
    });
  });

  it('labels full courses as full and disables them in the create drawer', async () => {
    const user = userEvent.setup();
    enrollmentsHook.courses = [{ id: 10, title: 'Algebra', capacity: 1 }];
    enrollmentsHook.enrollments = [
      {
        id: 100,
        studentId: 2,
        courseId: 10,
        enrolledAt: '2026-01-15T10:30:00Z',
      },
    ];

    render(<EnrollmentsView />);

    await user.click(screen.getByRole('button', { name: /Enroll student/i }));
    expect(await screen.findByText('Enroll student in course')).toBeInTheDocument();

    await user.click(screen.getByText('Select a course'));
    const fullOption = await screen.findByText('Algebra (1/1) — full', {
      selector: '.ant-select-item-option-content',
    });
    expect(fullOption.closest('.ant-select-item-option-disabled')).not.toBeNull();
  });
});
