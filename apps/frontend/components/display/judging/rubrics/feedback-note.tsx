import { Field } from 'formik';
import { TextField } from 'formik-mui';

interface Props {
  label: string;
  name: string;
  disabled?: boolean;
}

const FeedbackNote: React.FC<Props> = ({ label, name, disabled }) => {
  return (
    <Field
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
