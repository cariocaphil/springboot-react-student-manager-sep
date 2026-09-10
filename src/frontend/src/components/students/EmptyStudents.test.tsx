import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EmptyStudents from './EmptyStudents';

describe('EmptyStudents', () => {
  it('renders empty state and wires the add button', async () => {
    const user = userEvent.setup();
    const onAddClick = vi.fn();

    render(<EmptyStudents onAddClick={onAddClick} />);

    expect(
      screen.getByText(/No data/i, { selector: '.ant-empty-description' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Add New Student/i }));
    expect(onAddClick).toHaveBeenCalledTimes(1);
  });
});
