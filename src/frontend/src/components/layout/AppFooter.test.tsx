import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AppFooter from './AppFooter';

describe('AppFooter', () => {
  it('renders attribution and course link', () => {
    render(<AppFooter />);

    expect(screen.getByText('By Amigoscode')).toBeInTheDocument();

    const link = screen.getByRole('link', {
      name: /Fullstack Spring Boot & React for professionals/i,
    });
    expect(link).toHaveAttribute(
      'href',
      'https://amigoscode.com/p/full-stack-spring-boot-react'
    );
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
