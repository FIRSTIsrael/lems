import { CSSProperties } from 'react';
import { WithId } from 'mongodb';
import { Box, Stack, Typography } from '@mui/material';
import Markdown from 'react-markdown';
import { Slide, Appear } from '@lems/presentations';
import { Team } from '@lems/types';
import LogoStack from './logo-stack';

interface AwardWinnerSlideProps {
  name: string;
  place?: number;
  winner: string | WithId<Team>;
  color?: CSSProperties['color'];
  hideWinner?: boolean;
}

const AwardWinnerSlide: React.FC<AwardWinnerSlideProps> = ({
  name,
  place,
  winner,
  color,
  hideWinner = false
}) => {
  const isTeamAward = typeof winner !== 'string';

  const renderWinnerName = () => (
    <>
      <Typography fontSize="4rem" fontWeight={700}>
        {isTeamAward ? `#${winner.number} ${winner.name}` : winner}
      </Typography>
      {isTeamAward && (
        <Typography fontSize="3rem" fontWeight={500} color="text.secondary">
          {winner.affiliation.name}, {winner.affiliation.city}
        </Typography>
      )}
    </>
  );

  return (
    <Slide>
      <Stack px={20} textAlign="center">
        <Typography variant="h1" fontSize="6rem" gutterBottom>
          <Markdown>{place ? `${name}, מקום ${String(place)}` : name}</Markdown>
        </Typography>
        <Box
          sx={{
            background: '#f7f8f9',
            maxWidth: 'lg',
            px: 8,
            py: 6,
            borderRadius: 4,
            boxShadow: color && `-10px 10px 12px ${color}74`
          }}
        >
          <Typography fontSize="2.75rem" color="text.secondary">
            {isTeamAward ? 'מוענק לקבוצה' : 'מוענק ל'}
          </Typography>
          {hideWinner ? <Appear>{renderWinnerName()}</Appear> : renderWinnerName()}
        </Box>
        <LogoStack color={color} />
      </Stack>
    </Slide>
  );
};

export default AwardWinnerSlide;
