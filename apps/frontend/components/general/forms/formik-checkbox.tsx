import { FastField, FieldProps } from 'formik';
import { FormControlLabel, Checkbox, CheckboxProps } from '@mui/material';

interface FormikCheckboxProps extends CheckboxProps {
  name: string;
  label: string;
}

const FormikCheckbox: React.FC<FormikCheckboxProps> = ({ name, label, ...props }) => {
  return (
    <FastField name={name}>
      {({ field, form }: FieldProps) => (
        <FormControlLabel
          {...field}
          label={label}
          control={
            <Checkbox
              {...props}
              checked={field.value}
              onChange={(_e, checked) => form.setFieldValue(field.name, checked)}
            />
          }
        />
      )}
    </FastField>
  );
};

export default FormikCheckbox;
