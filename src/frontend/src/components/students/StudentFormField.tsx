import { Form, Input, Select } from 'antd';
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
          {field.type === 'text' ? (
            <Input {...rhfField} placeholder={field.placeholder} />
          ) : (
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
          )}
        </Form.Item>
      )}
    />
  );
}

export default StudentFormField;
