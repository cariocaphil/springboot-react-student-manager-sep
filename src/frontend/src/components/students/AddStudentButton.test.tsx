import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AddStudentButton from './AddStudentButton';

describe('AddStudentButton', () => {
  it('invokes onClick when pressed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<AddStudentButton onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: /Add New Student/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
