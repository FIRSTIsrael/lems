import { Stack } from '@mui/material';
import FormikTextField from '../../general/forms/formik-text-field';

interface FeedbackRowProps {
  description: string;
  feedback: { [key: string]: string };
  isEditable: boolean;
}

const FeedbackRow: React.FC<FeedbackRowProps> = ({ description, feedback, isEditable }) => {
  return (
    <Stack sx={{ my: 4 }} direction="row" spacing={4}>
      {Object.entries(feedback).map(([key, value]) => (
        <FormikTextField
          key={key}
          name={`feedback.${key}`}
          label={value}
          disabled={!isEditable}
          spellCheck
          multiline
          minRows={4}
        />
      ))}
    </Stack>
  );
};

export default FeedbackRow;
