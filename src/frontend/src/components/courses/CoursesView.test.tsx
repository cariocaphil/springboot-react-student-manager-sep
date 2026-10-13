import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import type { Course } from '../../types/course';
import type { CurrentUser } from '../../types/user';
import CoursesView from './CoursesView';

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

const coursesHook = {
  courses: [] as Course[],
  isLoading: false,
  isError: false,
  isFetching: false,
  retryLoad: vi.fn(),
  createCourse: vi.fn(),
  updateCourseById: vi.fn(),
  removeCourseById: vi.fn(),
};

vi.mock('../../hooks/useCourses', () => ({
  useCourses: () => coursesHook,
}));

const courses: Course[] = [
  {
    id: 1,
    title: 'Algebra',
    description: 'Intro algebra',
    capacity: 30,
  },
];

async function setCapacity(value: string): Promise<void> {
  const input = screen.getByPlaceholderText('Maximum seats');
  fireEvent.change(input, { target: { value } });
}

describe('CoursesView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { username: 'dev', role: 'ADMIN' };
    authState.canManageStudents = true;
    coursesHook.courses = [];
    coursesHook.isLoading = false;
    coursesHook.isError = false;
    coursesHook.isFetching = false;
    coursesHook.createCourse.mockResolvedValue(true);
    coursesHook.updateCourseById.mockResolvedValue(true);
  });

  it('shows a spinner while courses are loading', () => {
    coursesHook.isLoading = true;

    const { container } = render(<CoursesView />);

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('shows the load error and retries', async () => {
    const user = userEvent.setup();
    coursesHook.isError = true;

    render(<CoursesView />);

    expect(screen.getByText(i18n.t('courses.loadError.title'))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: i18n.t('courses.loadError.retry') }));
    expect(coursesHook.retryLoad).toHaveBeenCalled();
  });

  it('shows add control for ADMIN when the list is empty', () => {
    render(<CoursesView />);

    expect(screen.getByRole('button', { name: /Add New Course/i })).toBeInTheDocument();
  });

  it('hides add control for USER when the list is empty', () => {
    authState.user = { username: 'reader', role: 'USER' };
    authState.canManageStudents = false;

    render(<CoursesView />);

    expect(screen.queryByRole('button', { name: /Add New Course/i })).not.toBeInTheDocument();
  });

  it('shows delete for ADMIN and hides write controls for USER when courses exist', () => {
    coursesHook.courses = courses;

    const { unmount } = render(<CoursesView />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add New Course/i })).toBeInTheDocument();
    unmount();

    authState.user = { username: 'reader', role: 'USER' };
    authState.canManageStudents = false;
    render(<CoursesView />);

    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add New Course/i })).not.toBeInTheDocument();
  });

  it('opens the edit drawer when Edit is clicked', async () => {
    const user = userEvent.setup();
    coursesHook.courses = courses;

    render(<CoursesView />);

    await user.click(screen.getByText('Edit'));
    expect(await screen.findByText('Edit course')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Algebra')).toBeInTheDocument();
  });

  it('closes the drawer and clears edit state on cancel', async () => {
    const user = userEvent.setup();
    coursesHook.courses = courses;

    render(<CoursesView />);

    await user.click(screen.getByText('Edit'));
    expect(await screen.findByText('Edit course')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText('Edit course')).not.toBeInTheDocument();
    });
  });

  it('creates a course from the empty-state drawer', async () => {
    const user = userEvent.setup();

    render(<CoursesView />);

    await user.click(screen.getByRole('button', { name: /Add New Course/i }));
    expect(await screen.findByText('Create new course')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Please enter course title'), 'Algebra');
    await user.type(screen.getByPlaceholderText('Optional course description'), 'Intro algebra');
    await setCapacity('30');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(coursesHook.createCourse).toHaveBeenCalledWith({
        title: 'Algebra',
        description: 'Intro algebra',
        capacity: 30,
      });
    });
    expect(coursesHook.updateCourseById).not.toHaveBeenCalled();
  });

  it('updates a course from the edit drawer', async () => {
    const user = userEvent.setup();
    coursesHook.courses = courses;

    render(<CoursesView />);

    await user.click(screen.getByText('Edit'));
    expect(await screen.findByText('Edit course')).toBeInTheDocument();

    const titleInput = screen.getByDisplayValue('Algebra');
    await user.clear(titleInput);
    await user.type(titleInput, 'Algebra II');
    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    await waitFor(() => {
      expect(coursesHook.updateCourseById).toHaveBeenCalledWith(1, {
        title: 'Algebra II',
        description: 'Intro algebra',
        capacity: 30,
      });
    });
    expect(coursesHook.createCourse).not.toHaveBeenCalled();
  });
});
