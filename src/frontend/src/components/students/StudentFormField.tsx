import { Form, Input, Select } from 'antd';
import type { ControllerRenderProps } from 'react-hook-form';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { validationStatus } from '../../utils/form';
import type { StudentFormValues } from './studentForm';
import type { StudentFormFieldConfig } from './studentFormFields';

const { Option } = Select;

interface StudentFormFieldProps {
  field: StudentFormFieldConfig;
  control: Control<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
}

function renderFieldControl(
  field: StudentFormFieldConfig,
  rhfField: ControllerRenderProps<StudentFormValues, keyof StudentFormValues>
) {
  switch (field.type) {
    case 'text':
      return <Input {...rhfField} placeholder={field.placeholder} />;
    case 'select':
      return (
        <Select
          placeholder={field.placeholder}
          value={rhfField.value}
          onChange={rhfField.onChange}
          onBlur={rhfField.onBlur}
        >
          {field.options.map((option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}
        </Select>
      );
  }
}

function StudentFormField({ field, control, errors }: StudentFormFieldProps) {
  const fieldError = errors[field.name];

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: rhfField }) => (
        <Form.Item
          label={field.label}
          required
          validateStatus={validationStatus(!!fieldError)}
          help={fieldError?.message}
        >
          {renderFieldControl(field, rhfField)}
        </Form.Item>
      )}
    />
  );
}

export default StudentFormField;
