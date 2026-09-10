import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import StudentsLoadError from './StudentsLoadError';

describe('StudentsLoadError', () => {
  it('renders the load error copy and calls onRetry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<StudentsLoadError onRetry={onRetry} />);

    expect(screen.getByText(i18n.t('students.loadError.title'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('students.loadError.description'))).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: i18n.t('students.loadError.retry') }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
