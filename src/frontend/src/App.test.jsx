import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as client from './client';
import * as notify from './Notification';

vi.mock('./client');
vi.mock('./Notification');

const students = [
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
    client.getAllStudents.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    client.deleteStudent.mockResolvedValue({ ok: true });
  });

  it('shows empty state when there are no students', async () => {
    render(<App />);
    expect(await screen.findByText(/Add New Student/i)).toBeInTheDocument();
    expect(screen.getByText(/No Data/i)).toBeInTheDocument();
  });

  it('renders course footer link', async () => {
    render(<App />);
    await screen.findByText(/Add New Student/i);

    const link = screen.getByRole('link', {
      name: /Fullstack Spring Boot & React for professionals/i,
    });
    expect(link).toHaveAttribute(
      'href',
      'https://amigoscode.com/p/full-stack-spring-boot-react'
    );
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders student rows when the API returns data', async () => {
    client.getAllStudents.mockResolvedValue({
      ok: true,
      json: async () => students,
    });

    render(<App />);

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('alan@example.com')).toBeInTheDocument();
    expect(screen.getByText('Number of students')).toBeInTheDocument();
    expect(screen.getByText('FEMALE')).toBeInTheDocument();
    expect(screen.getByText('MALE')).toBeInTheDocument();
  });

  it('shows an error notification when listing students fails', async () => {
    client.getAllStudents.mockRejectedValue({
      response: {
        json: async () => ({
          message: 'Unavailable',
          status: 503,
          error: 'Service Unavailable',
        }),
      },
    });

    render(<App />);

    await waitFor(() => {
      expect(notify.errorNotification).toHaveBeenCalledWith(
        'There was an issue',
        'Unavailable[503] [Service Unavailable]'
      );
    });
    expect(await screen.findByText(/No Data/i)).toBeInTheDocument();
  });

  it('deletes a student after confirm and refreshes the list', async () => {
    const user = userEvent.setup();
    client.getAllStudents
      .mockResolvedValueOnce({
        ok: true,
        json: async () => students,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [students[1]],
      });

    render(<App />);

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();

    const adaRow = screen.getByText('Ada Lovelace').closest('tr');
    await user.click(within(adaRow).getByText('Delete'));
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
