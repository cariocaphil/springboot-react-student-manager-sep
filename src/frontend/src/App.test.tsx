import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as client from './client';
import * as notify from './Notification';
import i18n from './i18n';
import type { Student } from './types/student';

vi.mock('./client');
vi.mock('./Notification');

const students: Student[] = [
  {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    gender: 'FEMALE',
  },
  {
    id: 2,
    name: 'Alan',
    email: 'alan@example.com',
    gender: 'MALE',
  },
];

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.getAllStudents).mockResolvedValue([]);
    vi.mocked(client.deleteStudent).mockResolvedValue(undefined);
  });

  it('shows empty state when there are no students', async () => {
    render(<App />);
    expect(await screen.findByText(/Add New Student/i)).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('students.empty.description'), {
        selector: '.ant-empty-description',
      })
    ).toBeInTheDocument();
  });

  it('renders project tagline and repository footer link', async () => {
    render(<App />);
    await screen.findByText(/Add New Student/i);

    expect(screen.getByText(i18n.t('layout.tagline'))).toBeInTheDocument();
    const link = screen.getByRole('link', { name: i18n.t('layout.sourceLink') });
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/cariocaphil/springboot-react-student-manager-sep'
    );
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders student rows when the API returns data', async () => {
    vi.mocked(client.getAllStudents).mockResolvedValue(students);

    render(<App />);

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('alan@example.com')).toBeInTheDocument();
    expect(screen.getByText('Number of students')).toBeInTheDocument();
    expect(screen.getByText('FEMALE')).toBeInTheDocument();
    expect(screen.getByText('MALE')).toBeInTheDocument();
  });

  it('shows an in-page load error with retry instead of the empty state', async () => {
    const user = userEvent.setup();
    vi.mocked(client.getAllStudents)
      .mockRejectedValueOnce({
        response: {
          json: async () => ({
            message: 'Unavailable',
            status: 503,
            error: 'Service Unavailable',
          }),
        },
      })
      .mockResolvedValueOnce(students);

    render(<App />);

    expect(await screen.findByText(i18n.t('students.loadError.title'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('students.loadError.description'))).toBeInTheDocument();
    expect(notify.errorNotification).not.toHaveBeenCalled();
    expect(screen.queryByText(i18n.t('students.empty.description'))).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: i18n.t('students.loadError.retry') }));

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    await waitFor(() => {
      expect(client.getAllStudents).toHaveBeenCalledTimes(2);
    });
  });

  it('deletes a student after confirm and refreshes the list', async () => {
    const user = userEvent.setup();
    vi.mocked(client.getAllStudents)
      .mockResolvedValueOnce(students)
      .mockResolvedValueOnce([students[1]]);

    render(<App />);

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();

    const adaRow = screen.getByText('Ada Lovelace').closest('tr');
    expect(adaRow).not.toBeNull();
    await user.click(within(adaRow as HTMLElement).getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(client.deleteStudent).toHaveBeenCalledWith(1);
    });
    expect(notify.successNotification).toHaveBeenCalledWith(
      'Student deleted',
      'Student with 1 was deleted'
    );
    await waitFor(() => {
      expect(client.getAllStudents).toHaveBeenCalledTimes(2);
    });
  });

  it('opens the create drawer from the empty state', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByText(/Add New Student/i));
    expect(await screen.findByText('Create new student')).toBeInTheDocument();
  });
});
