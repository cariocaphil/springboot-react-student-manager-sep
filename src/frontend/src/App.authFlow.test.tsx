import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetch from 'unfetch';
import App from './App';
import { clearAuthCredentials, hasAuthCredentials } from './auth/authCredentials';
import i18n from './i18n';
import type { ApiResponse } from './types/api';

vi.mock('unfetch', () => ({
  default: vi.fn(),
}));
vi.mock('./Notification');

const mockedFetch = vi.mocked(fetch);

const okEmptyList = {
  ok: true,
  status: 200,
  statusText: 'OK',
  json: async () => [],
} as ApiResponse;

const unauthorized = {
  ok: false,
  status: 401,
  statusText: 'Unauthorized',
  json: async () => ({}),
} as ApiResponse;

async function signIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(i18n.t('login.username.label')), 'dev');
  await user.type(screen.getByLabelText(i18n.t('login.password.label')), 'changeme');
  await user.click(screen.getByRole('button', { name: i18n.t('login.submit') }));
}

describe('App auth flow', () => {
  beforeEach(() => {
    clearAuthCredentials();
    mockedFetch.mockReset();
    vi.clearAllMocks();
  });

  it('shows the login screen when unauthenticated', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: i18n.t('login.title') })).toBeInTheDocument();
    expect(screen.queryByText(/Add New Student/i)).not.toBeInTheDocument();
  });

  it('enters the students UI after a successful login', async () => {
    const user = userEvent.setup();
    mockedFetch.mockResolvedValue(okEmptyList as never);

    render(<App />);
    await signIn(user);

    expect(await screen.findByText(/Add New Student/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: i18n.t('layout.logout') })).toBeInTheDocument();
    expect(hasAuthCredentials()).toBe(true);
    expect(
      mockedFetch.mock.calls.some((call) => {
        const init = call[1] as { headers?: Record<string, string> } | undefined;
        return init?.headers?.Authorization?.startsWith('Basic ') === true;
      })
    ).toBe(true);
  });

  it('returns to login after logout and clears credentials', async () => {
    const user = userEvent.setup();
    mockedFetch.mockResolvedValue(okEmptyList as never);

    render(<App />);
    await signIn(user);
    expect(await screen.findByText(/Add New Student/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: i18n.t('layout.logout') }));

    expect(await screen.findByRole('heading', { name: i18n.t('login.title') })).toBeInTheDocument();
    expect(hasAuthCredentials()).toBe(false);
    expect(screen.queryByText(/Add New Student/i)).not.toBeInTheDocument();
  });

  it('returns to login when a later API call returns 401', async () => {
    const user = userEvent.setup();
    mockedFetch
      .mockResolvedValueOnce(okEmptyList as never)
      .mockResolvedValueOnce(unauthorized as never);

    render(<App />);
    await signIn(user);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: i18n.t('login.title') })).toBeInTheDocument();
    });
    expect(hasAuthCredentials()).toBe(false);
  });
});
