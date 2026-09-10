import { describe, expect, it } from 'vitest';
import de from './locales/de.json';
import en from './locales/en.json';

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (nested !== null && typeof nested === 'object' && !Array.isArray(nested)) {
      return flattenKeys(nested, path);
    }
    return [path];
  });
}

describe('i18n locale key parity', () => {
  it('keeps the same translation keys in en and de', () => {
    const enKeys = flattenKeys(en).sort();
    const deKeys = flattenKeys(de).sort();

    expect(deKeys).toEqual(enKeys);
  });
});
