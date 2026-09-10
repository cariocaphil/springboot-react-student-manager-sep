import { Form, Input, Select } from 'antd';
import type { ControllerRenderProps } from 'react-hook-form';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { validationStatus } from '../../utils/form';
import type { StudentFormValues } from './studentForm';
import { FieldType, type StudentFormFieldConfig } from './studentFormFields';

const { Option } = Select;

interface StudentFormFieldProps {
  field: StudentFormFieldConfig;
  control: Control<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
}

function renderFieldControl(
  field: StudentFormFieldConfig,
  rhfField: ControllerRenderProps<StudentFormValues, keyof StudentFormValues>,
  placeholder: string
) {
  switch (field.type) {
    case FieldType.Text:
      return <Input {...rhfField} placeholder={placeholder} />;
    case FieldType.Select:
      return (
        <Select
          placeholder={placeholder}
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
    default: {
      const _exhaustive: never = field;
      throw new Error(`Unsupported field type: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

function StudentFormField({ field, control, errors }: StudentFormFieldProps) {
  const { t } = useTranslation();
  const fieldError = errors[field.name];

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: rhfField }) => (
        <Form.Item
          label={t(field.labelKey)}
          required={field.required}
          validateStatus={validationStatus(!!fieldError)}
          help={fieldError?.message}
        >
          {renderFieldControl(field, rhfField, t(field.placeholderKey))}
        </Form.Item>
      )}
    />
  );
}

export default StudentFormField;
