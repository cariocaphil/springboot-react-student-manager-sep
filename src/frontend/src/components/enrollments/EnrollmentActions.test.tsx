import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EnrollmentActions from './EnrollmentActions';
import type { EnrollmentRow } from './joinEnrollmentRows';

const row: EnrollmentRow = {
  id: 100,
  studentId: 1,
  courseId: 10,
  enrolledAt: '2026-01-15T10:30:00Z',
  studentName: 'Ada Lovelace',
  courseTitle: 'Algebra',
  capacity: 30,
  enrollmentCount: 1,
  isCourseFull: false,
};

describe('EnrollmentActions', () => {
  it('confirms cancel and calls onCancel with the enrollment id', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<EnrollmentActions enrollment={row} onCancel={onCancel} />);

    await user.click(screen.getByText('Cancel'));
    expect(
      await screen.findByText('Cancel enrollment of Ada Lovelace in Algebra?')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    expect(onCancel).toHaveBeenCalledWith(100);
  });

  it('does not call onCancel when cancel is dismissed', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<EnrollmentActions enrollment={row} onCancel={onCancel} />);

    await user.click(screen.getByText('Cancel'));
    await user.click(await screen.findByRole('button', { name: 'No' }));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
