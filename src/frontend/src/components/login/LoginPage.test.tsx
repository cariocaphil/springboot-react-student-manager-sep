import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../auth/AuthContext';
import { clearAuthCredentials } from '../../auth/authCredentials';
import * as client from '../../client';
import i18n from '../../i18n';
import { createQueryClient } from '../../queryClient';
import AppProviders from '../layout/AppProviders';
import LoginPage from './LoginPage';

vi.mock('../../client', () => ({
  getCurrentUser: vi.fn(),
}));

function renderLogin() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProviders>
          <LoginPage />
        </AppProviders>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    clearAuthCredentials();
    vi.clearAllMocks();
  });

  it('shows validation errors when submitting empty fields', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: i18n.t('login.submit') }));

    expect(
      await screen.findByText(i18n.t('login.validation.usernameRequired'))
    ).toBeInTheDocument();
    expect(screen.getByText(i18n.t('login.validation.passwordRequired'))).toBeInTheDocument();
  });

  it('shows an invalid-credentials error when login fails with 401', async () => {
    const user = userEvent.setup();
    vi.mocked(client.getCurrentUser).mockRejectedValue({
      message: 'Unauthorized',
      response: { ok: false, status: 401, statusText: 'Unauthorized', json: async () => ({}) },
    });

    renderLogin();

    await user.type(screen.getByLabelText(i18n.t('login.username.label')), 'dev');
    await user.type(screen.getByLabelText(i18n.t('login.password.label')), 'wrong');
    await user.click(screen.getByRole('button', { name: i18n.t('login.submit') }));

    expect(await screen.findByText(i18n.t('login.invalidCredentials'))).toBeInTheDocument();
  });

  it('calls getCurrentUser with credentials on successful submit', async () => {
    const user = userEvent.setup();
    vi.mocked(client.getCurrentUser).mockResolvedValue({ username: 'dev', role: 'ADMIN' });

    renderLogin();

    await user.type(screen.getByLabelText(i18n.t('login.username.label')), 'dev');
    await user.type(screen.getByLabelText(i18n.t('login.password.label')), 'changeme');
    await user.click(screen.getByRole('button', { name: i18n.t('login.submit') }));

    await waitFor(() => {
      expect(client.getCurrentUser).toHaveBeenCalled();
    });
    expect(screen.queryByText(i18n.t('login.invalidCredentials'))).not.toBeInTheDocument();
  });
});
