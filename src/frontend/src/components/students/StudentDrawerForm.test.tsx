import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import StudentDrawerForm from './StudentDrawerForm';

async function chooseGender(label: string): Promise<void> {
  fireEvent.mouseDown(screen.getByRole('combobox'));
  const option = await screen.findByText(label, {
    selector: '.ant-select-item-option-content',
  });
  fireEvent.click(option);
}

describe('StudentDrawerForm', () => {
  const onClose = vi.fn();
  const onSave = vi.fn();
  const editingStudent = {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    gender: 'FEMALE' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    onSave.mockResolvedValue(true);
  });

  it('renders create form when drawer is open', () => {
    render(<StudentDrawerForm open onClose={onClose} onSave={onSave} />);

    expect(screen.getByText('Create new student')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Please enter student name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Please enter student email')).toBeInTheDocument();
  });

  it('prefills fields and uses edit copy when editing', () => {
    render(
      <StudentDrawerForm open editingStudent={editingStudent} onClose={onClose} onSave={onSave} />
    );

    expect(screen.getByText('Edit student')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ada@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save changes/i })).toBeInTheDocument();
  });

  it('closes drawer when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<StudentDrawerForm open onClose={onClose} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows validation messages when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<StudentDrawerForm open onClose={onClose} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText('Please enter student name')).toBeInTheDocument();
    expect(screen.getByText('Please enter student email')).toBeInTheDocument();
    expect(screen.getAllByText('Please select a gender').length).toBeGreaterThanOrEqual(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows validation message for invalid email', async () => {
    const user = userEvent.setup();
    render(<StudentDrawerForm open onClose={onClose} onSave={onSave} />);

    await user.type(screen.getByPlaceholderText('Please enter student name'), 'Ada');
    await user.type(screen.getByPlaceholderText('Please enter student email'), 'not-an-email');
    await chooseGender('FEMALE');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(i18n.t('students.validation.emailInvalid'))).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits a new student and closes on success', async () => {
    const user = userEvent.setup();
    render(<StudentDrawerForm open onClose={onClose} onSave={onSave} />);

    await user.type(screen.getByPlaceholderText('Please enter student name'), 'Ada Lovelace');
    await user.type(screen.getByPlaceholderText('Please enter student email'), 'ada@example.com');
    await chooseGender('FEMALE');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        gender: 'FEMALE',
      });
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('keeps drawer open when save fails', async () => {
    const user = userEvent.setup();
    onSave.mockResolvedValue(false);

    render(<StudentDrawerForm open onClose={onClose} onSave={onSave} />);

    await user.type(screen.getByPlaceholderText('Please enter student name'), 'Ada');
    await user.type(screen.getByPlaceholderText('Please enter student email'), 'ada@example.com');
    await chooseGender('MALE');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
