import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import LanguageSwitcher from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('switches the active language between English and German', async () => {
    await i18n.changeLanguage('en');
    render(<LanguageSwitcher />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: i18n.t('language.label') }));
    fireEvent.click(await screen.findByText('DE', { selector: '.ant-select-item-option-content' }));
    await waitFor(() => {
      expect(i18n.language).toBe('de');
    });

    fireEvent.mouseDown(screen.getByRole('combobox', { name: i18n.t('language.label') }));
    fireEvent.click(await screen.findByText('EN', { selector: '.ant-select-item-option-content' }));
    await waitFor(() => {
      expect(i18n.language).toBe('en');
    });
  });
});
