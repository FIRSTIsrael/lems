import { WithId } from 'mongodb';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Box, Stack, Typography } from '@mui/material';
import { Slide } from '@lems/presentations';
import { Team } from '@lems/types';

interface AwardWinnerSlideProps {
  name: string;
  place?: number;
  winner: string | WithId<Team>;
}

const AwardWinnerSlide: React.FC<AwardWinnerSlideProps> = ({ name, place, winner }) => {
  const isTeamAward = typeof winner !== 'string';

  return (
    <Slide>
      <Stack px={20} textAlign="center">
        <Typography variant="h1" fontSize="6rem" gutterBottom>
          <ReactMarkdown>{place ? `${name}, מקום ${String(place)}` : name}</ReactMarkdown>
        </Typography>
        <Box sx={{ background: '#f7f8f9', maxWidth: 'lg', px: 8, py: 6 }}>
          <Typography fontSize="2.75rem" color="text.secondary">
            {isTeamAward ? 'מוענק לקבוצה' : 'מוענק ל'}
          </Typography>
          <Typography fontSize="4rem" fontWeight={700}>
            {isTeamAward ? `#${winner.number}, ${winner.name}` : winner}
          </Typography>
          {isTeamAward && (
            <Typography fontSize="3rem" fontWeight={500} color="text.secondary">
              {winner.affiliation.name}, {winner.affiliation.city}
            </Typography>
          )}
        </Box>
      </Stack>
    </Slide>
  );
};

export default AwardWinnerSlide;
