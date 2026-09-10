import { describe, expect, it } from 'vitest';
import { EMAIL_INVALID_MESSAGE, EMAIL_PATTERN } from './email';

describe('EMAIL_PATTERN', () => {
  it('accepts a simple email', () => {
    expect(EMAIL_PATTERN.test('ada@example.com')).toBe(true);
  });

  it('rejects values without an @domain.tld shape', () => {
    expect(EMAIL_PATTERN.test('not-an-email')).toBe(false);
    expect(EMAIL_PATTERN.test('ada@')).toBe(false);
  });

  it('exports a stable invalid message', () => {
    expect(EMAIL_INVALID_MESSAGE).toBe('Please enter a valid email');
  });
});
