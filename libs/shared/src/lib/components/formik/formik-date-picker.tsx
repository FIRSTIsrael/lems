'use client';

import dayjs from 'dayjs';
import { FastField, FieldProps } from 'formik';
import { LocalizationProvider, DatePicker, DatePickerProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

type FormikDatePickerProps = {
  name: string;
  label?: string;
} & Omit<DatePickerProps, 'value' | 'onChange'>;

export const FormikDatePicker: React.FC<FormikDatePickerProps> = ({ name, label, ...props }) => {
  return (
    <FastField name={name}>
      {({ field, form }: FieldProps) => {
        const fieldError = form.touched[field.name] && form.errors[field.name];
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={label}
              {...props}
              value={field.value ? dayjs(field.value) : null}
              onChange={newDate => {
                if (newDate) {
                  form.setFieldValue(field.name, newDate.toDate());
                } else {
                  form.setFieldValue(field.name, null);
                }
              }}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(fieldError),
                  helperText: fieldError as string
                }
              }}
            />
          </LocalizationProvider>
        );
      }}
    </FastField>
  );
};
