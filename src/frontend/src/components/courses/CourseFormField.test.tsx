import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import type { CourseFormValues } from './courseForm';
import CourseFormField from './CourseFormField';
import { FieldType, type CourseFormFieldConfig } from './courseFormFields';

const titleField: CourseFormFieldConfig = {
  name: 'title',
  type: FieldType.Text,
  labelKey: 'courses.form.title.label',
  placeholderKey: 'courses.form.title.placeholder',
  span: 24,
  required: true,
};

describe('CourseFormField', () => {
  it('renders a text field with its label and placeholder', () => {
    function Harness() {
      const { control, formState } = useForm<CourseFormValues>({
        defaultValues: { title: '', description: '', capacity: undefined },
      });
      return (
        <Form>
          <CourseFormField field={titleField} control={control} errors={formState.errors} />
        </Form>
      );
    }

    render(<Harness />);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Please enter course title')).toBeInTheDocument();
  });
});
