import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Student } from '../../types/student';
import StudentActions from './StudentActions';

const ada: Student = {
  id: 7,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  gender: 'FEMALE',
};

describe('StudentActions', () => {
  it('renders delete and edit controls', () => {
    render(<StudentActions student={ada} onDelete={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('confirms delete and calls onDelete with the student id', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<StudentActions student={ada} onDelete={onDelete} onEdit={vi.fn()} />);

    await user.click(screen.getByText('Delete'));
    expect(await screen.findByText('Are you sure to delete Ada Lovelace')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    expect(onDelete).toHaveBeenCalledWith(7);
  });

  it('calls onEdit with the student when Edit is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<StudentActions student={ada} onDelete={vi.fn()} onEdit={onEdit} />);

    await user.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(ada);
  });

  it('does not call onDelete when delete is cancelled', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<StudentActions student={ada} onDelete={onDelete} onEdit={vi.fn()} />);

    await user.click(screen.getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: 'No' }));
    expect(onDelete).not.toHaveBeenCalled();
  });
});
