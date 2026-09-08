import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import App from './App';
import * as client from './client';

vi.mock('./client');

describe('App', () => {
  beforeEach(() => {
    client.getAllStudents.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it('shows empty state when there are no students', async () => {
    render(<App />);
    expect(await screen.findByText(/Add New Student/i)).toBeInTheDocument();
    expect(screen.getByText(/No Data/i)).toBeInTheDocument();
  });
});
