import { Box, Stack, Typography } from '@mui/material';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Slide } from '@lems/presentations';

interface TitleSlideProps {
  primary: string;
  secondary?: string;
}

const TitleSlide: React.FC<TitleSlideProps> = ({ primary, secondary }) => {
  return (
    <Slide>
      <Stack px={20} textAlign="center">
        <Typography variant="h1" fontSize="6rem" gutterBottom>
          <ReactMarkdown>{primary}</ReactMarkdown>
        </Typography>
        {secondary && (
          <Box sx={{ background: '#f7f8f9', maxWidth: 'lg', px: 4 }}>
            <Typography fontSize="2.75rem">
              <ReactMarkdown>{secondary}</ReactMarkdown>
            </Typography>
          </Box>
        )}
      </Stack>
    </Slide>
  );
};

export default TitleSlide;
