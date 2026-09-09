import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StudentsTable from './StudentsTable';
import type { Student } from '../../types/student';

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

describe('StudentsTable', () => {
  it('renders rows, count badge, and add control', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onAddClick = vi.fn();

    render(
      <StudentsTable
        students={students}
        onDelete={onDelete}
        onAddClick={onAddClick}
      />
    );

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('alan@example.com')).toBeInTheDocument();
    expect(screen.getByText('Number of students')).toBeInTheDocument();
    expect(
      document.querySelector('.site-badge-count-4 .ant-badge-count')
    ).toHaveTextContent('2');

    await user.click(screen.getByRole('button', { name: /Add New Student/i }));
    expect(onAddClick).toHaveBeenCalledTimes(1);
  });

  it('confirms delete for a row', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <StudentsTable
        students={students}
        onDelete={onDelete}
        onAddClick={vi.fn()}
      />
    );

    const adaRow = screen.getByText('Ada Lovelace').closest('tr');
    expect(adaRow).not.toBeNull();
    await user.click(within(adaRow as HTMLElement).getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: 'Yes' }));

    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
