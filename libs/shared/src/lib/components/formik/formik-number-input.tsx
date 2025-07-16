import { FastField, FieldProps } from 'formik';
import { NumberInput, NumberInputProps } from '../number-input';

export type FormikNumberInputProps = {
  name: string;
} & NumberInputProps;

export const FormikNumberInput: React.FC<FormikNumberInputProps> = ({ name, ...props }) => {
  return (
    <FastField name={name}>
      {({ field, form }: FieldProps) => (
        <NumberInput
          {...props}
          value={field.value}
          onChange={(e, value) => {
            e.preventDefault();
            if (value !== undefined) {
              form.setFieldValue(field.name, value);
            }
          }}
        />
      )}
    </FastField>
  );
};
