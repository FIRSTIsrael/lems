import { useState } from 'react';
import { Field, FieldProps } from 'formik';
import { TextField, Checkbox, Stack } from '@mui/material';

interface FormikConditionalTextFieldProps {
  name: string;
  label: string;
}

const FormikConditionalTextField: React.FC<FormikConditionalTextFieldProps> = ({ name, label }) => {
  const [checked, setChecked] = useState<boolean>(false);

  return (
    <Field name={name}>
      {({ field, form }: FieldProps) => (
        <Stack direction="row" alignItems="center">
          <Checkbox
            checked={checked}
            onChange={(_e, newValue) => {
              setChecked(newValue);
              if (!newValue) form.setFieldValue(field.name, '');
            }}
          />
          <TextField
            variant="standard"
            fullWidth
            {...field}
            label={label}
            disabled={!checked}
            value={field.value}
            onChange={e => form.setFieldValue(field.name, e.target.value)}
          />
        </Stack>
      )}
    </Field>
  );
};

export default FormikConditionalTextField;
