import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import AppFooter, { REPO_SOURCE_URL } from './AppFooter';

describe('AppFooter', () => {
  it('renders the project tagline and links to this repository', () => {
    render(<AppFooter />);

    expect(screen.getByText(i18n.t('layout.tagline'))).toBeInTheDocument();

    const link = screen.getByRole('link', { name: i18n.t('layout.sourceLink') });
    expect(link).toHaveAttribute('href', REPO_SOURCE_URL);
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
