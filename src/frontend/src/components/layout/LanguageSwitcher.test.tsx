import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { AppLanguageCode } from '../../i18n/languages';
import LanguageSwitcher from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  afterEach(async () => {
    await i18n.changeLanguage(AppLanguageCode.En);
  });

  it('switches the active language between English and German', async () => {
    await i18n.changeLanguage(AppLanguageCode.En);
    render(<LanguageSwitcher />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: i18n.t('language.label') }));
    fireEvent.click(await screen.findByText('DE', { selector: '.ant-select-item-option-content' }));
    await waitFor(() => {
      expect(i18n.language).toBe(AppLanguageCode.De);
    });

    fireEvent.mouseDown(screen.getByRole('combobox', { name: i18n.t('language.label') }));
    fireEvent.click(await screen.findByText('EN', { selector: '.ant-select-item-option-content' }));
    await waitFor(() => {
      expect(i18n.language).toBe(AppLanguageCode.En);
    });
  });
});
