import { Form } from 'antd';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { validationStatus } from '../../utils/form';
import type { CourseFormValues } from './courseForm';
import type { CourseFormFieldConfig } from './courseFormFields';
import { renderCourseFieldControl } from './renderCourseFieldControl';

interface CourseFormFieldProps {
  field: CourseFormFieldConfig;
  control: Control<CourseFormValues>;
  errors: FieldErrors<CourseFormValues>;
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
          {renderCourseFieldControl(field, rhfField, t(field.placeholderKey))}
        </Form.Item>
      )}
    />
  );
}

export default CourseFormField;
