import { FastField, FieldProps } from 'formik';
import { FormControlLabel, Checkbox, CheckboxProps } from '@mui/material';

interface FormikCheckboxProps extends CheckboxProps {
  name: string;
  label: string;
  readOnly?: boolean;
}

const FormikCheckbox: React.FC<FormikCheckboxProps> = ({ name, label, readOnly, ...props }) => {
  return (
    <FastField name={name}>
      {({ field, form }: FieldProps) => (
        <FormControlLabel
          label={label}
          control={
            <Checkbox
              {...props}
              {...field}
              checked={field.value}
              onChange={
                readOnly ? undefined : (_e, checked) => form.setFieldValue(field.name, checked)
              }
            />
          }
        />
      )}
    </FastField>
  );
};

export default FormikCheckbox;
