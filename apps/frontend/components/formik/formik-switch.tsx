import { FastField, FieldProps } from 'formik';
import { FormControlLabel, Switch, SwitchProps } from '@mui/material';

interface FormikSwitchProps extends SwitchProps {
  name: string;
  label: string;
  readOnly?: boolean;
}

const FormikSwitch: React.FC<FormikSwitchProps> = ({ name, label, readOnly, ...props }) => {
  return (
    <FastField name={name}>
      {({ field, form }: FieldProps) => (
        <FormControlLabel
          label={label}
          control={
            <Switch
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

export default FormikSwitch;
