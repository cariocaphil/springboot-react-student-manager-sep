import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('renders title, description, and optional action', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <ErrorState
        title="Could not load"
        description="Please try again."
        action={
          <button type="button" onClick={onAction}>
            Retry
          </button>
        }
      />
    );

    expect(screen.getByText('Could not load')).toBeInTheDocument();
    expect(screen.getByText('Please try again.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders without an action', () => {
    render(<ErrorState title="Broken" description="No action available." />);

    expect(screen.getByText('Broken')).toBeInTheDocument();
    expect(screen.getByText('No action available.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
