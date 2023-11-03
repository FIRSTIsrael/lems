import { WithId } from 'mongodb';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Paper, Typography } from '@mui/material';
import { Slide, Appear } from '@lems/presentations';
import { Team } from '@lems/types';
import { localizeTeam } from '../../localization/teams';

interface AwardWinnerSlideProps {
  name: string;
  place?: number;
  winner: string | WithId<Team>;
}

const AwardWinnerSlide: React.FC<AwardWinnerSlideProps> = ({ name, place, winner }) => {
  return (
    <Slide>
      <Paper sx={{ mx: '2rem', p: 8, textAlign: 'center' }}>
        <Typography variant="h1" fontSize="6rem" gutterBottom>
          <ReactMarkdown>{name}</ReactMarkdown>
        </Typography>
        {place && (
          <Typography variant="h1" fontSize="3rem" color="text.secondary">
            <ReactMarkdown>{`מקום ${String(place)}`}</ReactMarkdown>
          </Typography>
        )}
        <Appear>
          <Typography variant="h3" fontSize="3rem" color="text.secondary">
            <ReactMarkdown>
              {typeof winner === 'string' ? String(winner) : localizeTeam(winner)}
            </ReactMarkdown>
          </Typography>
        </Appear>
      </Paper>
    </Slide>
  );
};

export default AwardWinnerSlide;
