import dayjs, { Dayjs } from 'dayjs';
import { FastField, FieldProps } from 'formik';
import { LocalizationProvider, TimePicker, TimePickerProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

type FormikTimePickerProps = {
  name: string;
  label?: string;
} & TimePickerProps<Dayjs>;

const FormikTimePicker: React.FC<FormikTimePickerProps> = ({ name, label, ...props }) => {
  return (
    <FastField name={name}>
      {({ field, form }: FieldProps) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            label={label}
            {...props}
            value={dayjs(field.value)}
            sx={{ minWidth: 150 }}
            onChange={newTime => {
              if (newTime) {
                form.setFieldValue(field.name, newTime.set('seconds', 0).toDate());
              }
            }}
            ampm={false}
            format="HH:mm"
            views={['minutes', 'hours']}
          />
        </LocalizationProvider>
      )}
    </FastField>
  );
};

export default FormikTimePicker;
