import { FormControlLabel, RadioGroupProps, RadioGroup, Radio, FormHelperText, FormControl, FormLabel } from "@mui/material";
import { FastField, FieldProps } from "formik";

interface FormikRadioGroupProps extends RadioGroupProps {
  name: string;
  label: string;
  options: Record<string, string>[];
};

const FormikRadioGroup: React.FC<FormikRadioGroupProps> = ({
  name,
  label,
  options,
}) => {
  return (
    <FastField name={name}>
      {({
        field,
        form: { touched, errors }, }: FieldProps) => {
        const fieldError = touched[name] && errors[name];
        return (
          <FormControl
            component="fieldset"
            error={Boolean(fieldError)}
          >
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup {...field}>
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {fieldError && (
              <FormHelperText>{errors[name] as string}</FormHelperText>
            )}
          </FormControl>
        );
      }}
    </FastField>
  );
};


export default FormikRadioGroup;