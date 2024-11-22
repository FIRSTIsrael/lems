import { FastField, FieldProps } from 'formik';
import { TextField, TextFieldProps } from '@mui/material';

type FormikTextFieldProps = {
  name: string;
  label?: string;
} & TextFieldProps;

const FormikTextField: React.FC<FormikTextFieldProps> = ({ name, label, ...props }) => {
  return (
    <FastField name={name}>
      {({ field, form }: FieldProps) => (
        <TextField
          fullWidth
          {...props}
          {...field}
          label={label}
          value={field.value}
          onChange={e => form.setFieldValue(field.name, e.target.value)}
        />
      )}
    </FastField>
  );
};

export default FormikTextField;
