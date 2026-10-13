import { Input, InputNumber } from 'antd';
import type { ControllerRenderProps } from 'react-hook-form';
import type { CourseFormValues } from './courseForm';
import { FieldType, type CourseFormFieldConfig } from './courseFormFields';

export function renderCourseFieldControl(
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
