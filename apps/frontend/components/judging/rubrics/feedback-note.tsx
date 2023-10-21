import { TextField } from '@mui/material';
import { FastField, FieldProps } from 'formik';

interface FeedbackNoteProps {
  label: string;
  name: string;
  disabled?: boolean;
}

const FeedbackNote: React.FC<FeedbackNoteProps> = ({ label, name, disabled }) => {
  return (
    <FastField name={name}>
      {({ field, form }: FieldProps) => (
        <TextField
          fullWidth
          label={label}
          spellCheck
          multiline
          minRows={4}
          variant="outlined"
          disabled={disabled}
          {...field}
          value={field.value}
          onChange={e => form.setFieldValue(field.name, e.target.value)}
        />
      )}
    </FastField>
  );
};

export default FeedbackNote;
