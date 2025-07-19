import { useState } from 'react';
import { Field, FieldProps } from 'formik';
import { TextField, Checkbox, Stack } from '@mui/material';

export interface FormikConditionalTextFieldProps {
  name: string;
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export const FormikConditionalTextField: React.FC<FormikConditionalTextFieldProps> = ({
  name,
  label,
  disabled,
  readOnly
}) => {
  const [checked, setChecked] = useState<boolean>(false);

  return (
    <Field name={name}>
      {({ field, form }: FieldProps) => (
        <Stack direction="row" alignItems="center">
          <Checkbox
            checked={readOnly ? !!field.value : checked}
            disabled={disabled}
            onChange={
              readOnly
                ? undefined
                : (_e, newValue) => {
                    setChecked(newValue);
                    if (!newValue) form.setFieldValue(field.name, '');
                  }
            }
          />
          <TextField
            variant="standard"
            fullWidth
            {...field}
            label={label}
            disabled={disabled || readOnly ? false : !checked}
            value={field.value}
            onChange={e => form.setFieldValue(field.name, e.target.value)}
            slotProps={{
              input: { readOnly }
            }}
          />
        </Stack>
      )}
    </Field>
  );
};
