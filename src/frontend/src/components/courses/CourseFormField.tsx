import { Form, Input, InputNumber } from 'antd';
import type { ControllerRenderProps } from 'react-hook-form';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { validationStatus } from '../../utils/form';
import type { CourseFormValues } from './courseForm';
import { FieldType, type CourseFormFieldConfig } from './courseFormFields';

interface CourseFormFieldProps {
  field: CourseFormFieldConfig;
  control: Control<CourseFormValues>;
  errors: FieldErrors<CourseFormValues>;
}

export function renderFieldControl(
  field: CourseFormFieldConfig,
  rhfField: ControllerRenderProps<CourseFormValues, keyof CourseFormValues>,
  placeholder: string
) {
  switch (field.type) {
    case FieldType.Text:
      return <Input {...rhfField} value={String(rhfField.value ?? '')} placeholder={placeholder} />;
    case FieldType.TextArea:
      return (
        <Input.TextArea
          {...rhfField}
          value={String(rhfField.value ?? '')}
          placeholder={placeholder}
          rows={3}
        />
      );
    case FieldType.Number:
      return (
        <InputNumber
          style={{ width: '100%' }}
          placeholder={placeholder}
          value={typeof rhfField.value === 'number' ? rhfField.value : undefined}
          onChange={(value) => {
            rhfField.onChange(value ?? undefined);
          }}
          onBlur={rhfField.onBlur}
          min={field.min}
        />
      );
    default: {
      const _exhaustive: never = field;
      throw new Error(`Unsupported field type: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

function CourseFormField({ field, control, errors }: CourseFormFieldProps) {
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

export default CourseFormField;
