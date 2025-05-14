import { FastField, FieldProps } from 'formik';
import CustomNumberInput from '../../field/scoresheet/number-input';
import { TextFieldProps } from '@mui/material/TextField';

interface CustomNumberInputProps
  extends Omit<TextFieldProps, 'onChange' | 'value' | 'type' | 'disabled'> {
  value: number | null;
  onChange: (event: React.MouseEvent | React.ChangeEvent, value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

type FormikNumberInputProps = {
  name: string;
  label?: string;
} & CustomNumberInputProps;

const FormikNumberInput: React.FC<FormikNumberInputProps> = ({ name, label, ...props }) => {
  return (
    <FastField name={name}>
      {({ field, form }: FieldProps) => (
        <CustomNumberInput
          {...props}
          value={field.value}
          onChange={(e, value) => {
            e.preventDefault();
            value !== undefined && form.setFieldValue(field.name, value);
          }}
        />
      )}
    </FastField>
  );
};

export default FormikNumberInput;
