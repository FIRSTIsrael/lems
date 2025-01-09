import { FastField, FieldProps } from 'formik';
import { NumberInputProps } from '@mui/base/Unstable_NumberInput';
import CustomNumberInput from '../../field/scoresheet/number-input';

type FormikNumberInputProps = {
  name: string;
  label?: string;
} & NumberInputProps;

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
