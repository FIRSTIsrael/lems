import { CSSProperties } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import Markdown from 'react-markdown';
import { Slide } from '@lems/presentations';
import LogoStack from './logo-stack';

interface TitleSlideProps {
  primary: string;
  secondary?: string;
  color?: CSSProperties['color'];
}

const TitleSlide: React.FC<TitleSlideProps> = ({ primary, secondary, color }) => {
  return (
    <Slide>
      <Stack px={20} textAlign="center" alignItems="center">
        <Typography variant="h1" fontSize="6rem" gutterBottom>
          <Markdown>{primary}</Markdown>
        </Typography>
        {secondary && (
          <Box sx={{ background: '#f7f8f9', maxWidth: 'lg', px: 15, borderRadius: 4 }}>
            <Typography fontSize="2.75rem">
              <Markdown>{secondary}</Markdown>
            </Typography>
          </Box>
        )}
        <LogoStack color={color} />
      </Stack>
    </Slide>
  );
};

export default TitleSlide;
