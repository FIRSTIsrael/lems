import { Divider, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import FormikTextField from '../../general/forms/formik-text-field';
import Markdown from 'react-markdown';
import { CategoryColors, JudgingCategory } from '@lems/types';

interface FeedbackRowProps {
  description: string;
  feedback: { [key: string]: string };
  isEditable: boolean;
  category: JudgingCategory;
}

const FeedbackRow: React.FC<FeedbackRowProps> = ({
  description,
  feedback,
  isEditable,
  category
}) => {
  return (
    <Stack
      component={Paper}
      my={4}
      divider={<Divider sx={{ border: '1px black solid' }} flexItem />}
      border="2px black solid"
    >
      <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
        {Object.values(feedback).map((value, index) => (
          <Typography
            fontWeight={600}
            sx={{
              width: '100%',
              height: 40,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {value}...
          </Typography>
        ))}
      </Stack>
      <Grid size={12} px={2} sx={{ background: CategoryColors[category] }}>
        <Markdown>{description}</Markdown>
      </Grid>
      <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
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
    </Stack>
  );
};

export default FeedbackRow;
