import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Course } from '../../types/course';
import CourseActions from './CourseActions';

const algebra: Course = {
  id: 7,
  title: 'Algebra',
  description: 'Intro algebra',
  capacity: 30,
};

describe('CourseActions', () => {
  it('renders delete and edit controls', () => {
    render(<CourseActions course={algebra} onDelete={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('confirms delete and calls onDelete with the course id', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<CourseActions course={algebra} onDelete={onDelete} onEdit={vi.fn()} />);

    await user.click(screen.getByText('Delete'));
    expect(await screen.findByText('Are you sure to delete Algebra')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    expect(onDelete).toHaveBeenCalledWith(7);
  });

  it('calls onEdit with the course when Edit is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<CourseActions course={algebra} onDelete={vi.fn()} onEdit={onEdit} />);

    await user.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(algebra);
  });

  it('does not call onDelete when delete is cancelled', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<CourseActions course={algebra} onDelete={onDelete} onEdit={vi.fn()} />);

    await user.click(screen.getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: 'No' }));
    expect(onDelete).not.toHaveBeenCalled();
  });
});
