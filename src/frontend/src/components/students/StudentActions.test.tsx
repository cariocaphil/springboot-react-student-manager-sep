import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StudentActions from './StudentActions';

describe('StudentActions', () => {
  it('renders delete and edit controls', () => {
    render(<StudentActions studentName="Ada" studentId={1} onDelete={vi.fn()} />);

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('confirms delete and calls onDelete with the student id', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<StudentActions studentName="Ada Lovelace" studentId={7} onDelete={onDelete} />);

    await user.click(screen.getByText('Delete'));
    expect(await screen.findByText('Are you sure to delete Ada Lovelace')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    expect(onDelete).toHaveBeenCalledWith(7);
  });

  it('does not call onDelete when delete is cancelled', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<StudentActions studentName="Ada" studentId={1} onDelete={onDelete} />);

    await user.click(screen.getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: 'No' }));
    expect(onDelete).not.toHaveBeenCalled();
  });
});
