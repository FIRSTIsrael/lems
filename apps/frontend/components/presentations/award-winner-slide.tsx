import { WithId } from 'mongodb';
import { Box, Stack, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Appear, Slide } from '@lems/presentations';
import { DivisionColor, Team } from '@lems/types';
import { getDivisionColor } from '../../lib/utils/colors';
import LogoStack from './logo-stack';

interface AwardWinnerSlideProps {
  name: string;
  place?: number;
  winner: string | WithId<Team>;
  color?: DivisionColor;
}

const AwardWinnerSlide: React.FC<AwardWinnerSlideProps> = ({ name, place, winner, color }) => {
  const isTeamAward = typeof winner !== 'string';

  return (
    <Slide>
      <Stack px={20} textAlign="center">
        <Typography variant="h1" fontSize="6rem" gutterBottom>
          <ReactMarkdown>{place ? `${name}, מקום ${String(place)}` : name}</ReactMarkdown>
        </Typography>
        <Box
          sx={{
            background: '#f7f8f9',
            maxWidth: 'lg',
            px: 8,
            py: 6,
            borderRadius: 4,
            boxShadow: color && `-10px 10px 12px ${getDivisionColor(color)}74`
          }}
        >
          <Typography fontSize="2.75rem" color="text.secondary">
            {isTeamAward ? 'מוענק לקבוצה' : 'מוענק ל'}
          </Typography>
          <Appear>
            <Typography fontSize="4rem" fontWeight={700}>
              {isTeamAward ? `#${winner.number} ${winner.name}` : winner}
            </Typography>
            {isTeamAward && (
              <Typography fontSize="3rem" fontWeight={500} color="text.secondary">
                {winner.affiliation.name}, {winner.affiliation.city}
              </Typography>
            )}
          </Appear>
        </Box>
        <LogoStack />
      </Stack>
    </Slide>
  );
};

export default AwardWinnerSlide;
