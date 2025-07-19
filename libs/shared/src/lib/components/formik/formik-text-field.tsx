import { KeyboardEventHandler, useRef } from 'react';
import { Field, FieldProps } from 'formik';
import { TextField, TextFieldProps } from '@mui/material';

export type FormikTextFieldProps = {
  name: string;
  label?: string;
  blurOnEsc?: boolean;
} & TextFieldProps;

export const FormikTextField: React.FC<FormikTextFieldProps> = ({
  name,
  label,
  blurOnEsc,
  ...props
}) => {
  const textFieldRef = useRef<HTMLInputElement>(null);

  const handleKeyDown: KeyboardEventHandler = e => {
    if (blurOnEsc && e.key === 'Escape') {
      textFieldRef.current?.blur();
    }
  };

  return (
    <Field name={name}>
      {({ field, form }: FieldProps) => (
        <TextField
          inputRef={textFieldRef}
          fullWidth
          {...props}
          {...field}
          label={label}
          value={field.value}
          onChange={e => form.setFieldValue(field.name, e.target.value)}
          onKeyDown={handleKeyDown}
        />
      )}
    </Field>
  );
};
