import { FastField, FieldProps } from 'formik';
import { FormControlLabel, Checkbox } from '@mui/material';

interface FormikCheckboxProps {
  name: string;
  label: string;
}

const FormikCheckbox: React.FC<FormikCheckboxProps> = ({ name, label }) => {
  return (
    <FastField name={name}>
      {({ field, form }: FieldProps) => (
        <FormControlLabel
          {...field}
          label={label}
          control={
            <Checkbox
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
