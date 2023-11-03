import { Paper, Typography } from '@mui/material';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Slide } from '@lems/presentations';

interface TitleSlideProps {
  primary: string;
  secondary?: string;
}

const TitleSlide: React.FC<TitleSlideProps> = ({ primary, secondary }) => {
  return (
    <Slide>
      <Paper sx={{ mx: '50px', p: 8, textAlign: 'center' }}>
        <Typography variant="h1" fontSize="6rem" gutterBottom>
          <ReactMarkdown>{primary}</ReactMarkdown>
        </Typography>
        {secondary && (
          <Typography variant="h1" fontSize="3rem" color="text.secondary">
            <ReactMarkdown>{secondary}</ReactMarkdown>
          </Typography>
        )}
      </Paper>
    </Slide>
  );
};

export default TitleSlide;
