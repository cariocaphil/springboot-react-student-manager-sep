import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import EmptyStudents from './EmptyStudents';

describe('EmptyStudents', () => {
  it('renders empty state and wires the add button for admins', async () => {
    const user = userEvent.setup();
    const onAddClick = vi.fn();

    render(<EmptyStudents canManageStudents onAddClick={onAddClick} />);

    expect(
      screen.getByText(i18n.t('students.empty.description'), {
        selector: '.ant-empty-description',
      })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Add New Student/i }));
    expect(onAddClick).toHaveBeenCalledTimes(1);
  });

  it('hides the add button when the caller cannot manage students', () => {
    render(<EmptyStudents canManageStudents={false} onAddClick={vi.fn()} />);

    expect(
      screen.getByText(i18n.t('students.empty.description'), {
        selector: '.ant-empty-description',
      })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add New Student/i })).not.toBeInTheDocument();
  });
});
