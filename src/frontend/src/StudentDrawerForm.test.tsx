import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentDrawerForm from './StudentDrawerForm';
import * as client from './client';
import * as notify from './Notification';
import type { ApiResponse } from './types';

vi.mock('./client');
vi.mock('./Notification');

async function chooseGender(label: string): Promise<void> {
  fireEvent.mouseDown(screen.getByRole('combobox'));
  const option = await screen.findByText(label, {
    selector: '.ant-select-item-option-content',
  });
  fireEvent.click(option);
}

describe('StudentDrawerForm', () => {
  const setShowDrawer = vi.fn();
  const fetchStudents = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.addNewStudent).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => undefined,
    } as ApiResponse);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders create form when drawer is open', () => {
    render(
      <StudentDrawerForm
        showDrawer
        setShowDrawer={setShowDrawer}
        fetchStudents={fetchStudents}
      />
    );

    expect(screen.getByText('Create new student')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Please enter student name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Please enter student email')).toBeInTheDocument();
  });

  it('closes drawer when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <StudentDrawerForm
        showDrawer
        setShowDrawer={setShowDrawer}
        fetchStudents={fetchStudents}
      />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(setShowDrawer).toHaveBeenCalledWith(false);
  });

  it('shows validation messages when submitting empty form', async () => {
    const user = userEvent.setup();
    render(
      <StudentDrawerForm
        showDrawer
        setShowDrawer={setShowDrawer}
        fetchStudents={fetchStudents}
      />
    );

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText('Please enter student name')).toBeInTheDocument();
    expect(screen.getByText('Please enter student email')).toBeInTheDocument();
    expect(screen.getAllByText('Please select a gender').length).toBeGreaterThanOrEqual(1);
    expect(window.alert).toHaveBeenCalled();
    expect(client.addNewStudent).not.toHaveBeenCalled();
  });

  it('submits a new student and refreshes the list', async () => {
    const user = userEvent.setup();
    render(
      <StudentDrawerForm
        showDrawer
        setShowDrawer={setShowDrawer}
        fetchStudents={fetchStudents}
      />
    );

    await user.type(screen.getByPlaceholderText('Please enter student name'), 'Ada Lovelace');
    await user.type(screen.getByPlaceholderText('Please enter student email'), 'ada@example.com');
    await chooseGender('FEMALE');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(client.addNewStudent).toHaveBeenCalledWith({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        gender: 'FEMALE',
      });
    });

    expect(notify.successNotification).toHaveBeenCalledWith(
      'Student successfully added',
      'Ada Lovelace was added to the system'
    );
    expect(setShowDrawer).toHaveBeenCalledWith(false);
    expect(fetchStudents).toHaveBeenCalled();
  });

  it('shows error notification when add fails', async () => {
    const user = userEvent.setup();
    vi.mocked(client.addNewStudent).mockRejectedValue({
      response: {
        json: async () => ({
          message: 'Email taken',
          status: 400,
          error: 'Bad Request',
        }),
      },
    });

    render(
      <StudentDrawerForm
        showDrawer
        setShowDrawer={setShowDrawer}
        fetchStudents={fetchStudents}
      />
    );

    await user.type(screen.getByPlaceholderText('Please enter student name'), 'Ada');
    await user.type(screen.getByPlaceholderText('Please enter student email'), 'ada@example.com');
    await chooseGender('MALE');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(notify.errorNotification).toHaveBeenCalledWith(
        'There was an issue',
        'Email taken [400] [Bad Request]',
        'bottomLeft'
      );
    });
    expect(fetchStudents).not.toHaveBeenCalled();
  });
});
