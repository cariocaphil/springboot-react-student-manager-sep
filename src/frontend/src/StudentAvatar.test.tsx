import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StudentAvatar from './components/StudentAvatar';

describe('StudentAvatar', () => {
  it('shows a user icon for blank names', () => {
    const { container } = render(<StudentAvatar name="   " />);
    expect(container.querySelector('[data-icon="user"]')).toBeInTheDocument();
  });

  it('shows the first character for a single-word name', () => {
    render(<StudentAvatar name="Ada" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows first and last characters for multi-word names', () => {
    render(<StudentAvatar name="Ada Lovelace" />);
    expect(screen.getByText('Ae')).toBeInTheDocument();
  });
});
