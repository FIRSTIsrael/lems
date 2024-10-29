import { Divider, Paper, Stack, Typography, Box } from '@mui/material';
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
            key={index}
            fontWeight={600}
            sx={{
              width: '100%',
              height: 35,
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
        <Box height={25} justifyContent="center" marginTop={-1} marginBottom={0.5}>
          <Markdown>{description}</Markdown>
        </Box>
      </Grid>
      <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
        {Object.entries(feedback).map(([key, value], index) => (
          <FormikTextField
            key={key}
            name={`feedback.${key}`}
            disabled={!isEditable}
            spellCheck
            multiline
            minRows={4}
            slotProps={{
              input: { sx: { borderRadius: `0 0 ${index === 0 ? '0 12px' : '12px 0'}` } }
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default FeedbackRow;
