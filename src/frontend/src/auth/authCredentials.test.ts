import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAuthCredentials,
  encodeBasicAuthorizationHeader,
  getAuthorizationHeader,
  hasAuthCredentials,
  notifyUnauthorized,
  setAuthCredentials,
  setUnauthorizedHandler,
} from './authCredentials';

describe('authCredentials', () => {
  beforeEach(() => {
    clearAuthCredentials();
    setUnauthorizedHandler(null);
  });

  it('stores credentials in memory and builds a Basic Authorization header', () => {
    expect(hasAuthCredentials()).toBe(false);
    expect(getAuthorizationHeader()).toBeUndefined();

    setAuthCredentials({ username: 'dev', password: 'changeme' });

    expect(hasAuthCredentials()).toBe(true);
    expect(getAuthorizationHeader()).toBe(encodeBasicAuthorizationHeader('dev', 'changeme'));
  });

  it('clears credentials', () => {
    setAuthCredentials({ username: 'dev', password: 'changeme' });
    clearAuthCredentials();

    expect(hasAuthCredentials()).toBe(false);
    expect(getAuthorizationHeader()).toBeUndefined();
  });

  it('notifies the unauthorized handler when registered', () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);

    notifyUnauthorized();

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
