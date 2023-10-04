import { FastField } from 'formik';
import { TextField } from 'formik-mui';

interface FeedbackNoteProps {
  label: string;
  name: string;
  disabled?: boolean;
}

const FeedbackNote: React.FC<FeedbackNoteProps> = ({ label, name, disabled }) => {
  return (
    <FastField
      component={TextField}
      fullWidth
      label={label}
      name={name}
      spellCheck
      multiline
      minRows={4}
      variant="outlined"
      disabled={disabled}
    />
  );
};

export default FeedbackNote;
