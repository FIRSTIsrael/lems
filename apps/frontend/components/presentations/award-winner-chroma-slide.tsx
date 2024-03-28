import { WithId } from 'mongodb';
import Image from 'next/image';
import { Box, Typography } from '@mui/material';
import { Slide } from '@lems/presentations';
import { DivisionColor, Team } from '@lems/types';
import { getDivisionColor } from '../../lib/utils/colors';

interface AwardWinnerChromaSlideProps {
  name: string;
  place?: number;
  winner: string | WithId<Team>;
  color?: DivisionColor;
}

const AwardWinnerChromaSlide: React.FC<AwardWinnerChromaSlideProps> = ({
  name,
  place,
  winner,
  color
}) => {
  const isTeamAward = typeof winner !== 'string';

  return (
    <Slide chromaKey={true}>
      <Box
        sx={{
          background: '#f7f8f9',
          width: 1920 * 0.85, // This is trash code, but it'll work until next year
          px: 6,
          py: 2,
          borderRadius: 4,
          textAlign: 'center',
          position: 'absolute',
          bottom: 60,
          boxShadow: color && `-10px 10px 12px ${getDivisionColor(color)}74`
        }}
      >
        <Typography fontSize="3.75rem">
          {place ? `${name}, מקום ${String(place)}` : name}
        </Typography>
        <Typography fontSize="4rem" fontWeight={700} gutterBottom>
          {isTeamAward ? `#${winner.number} ${winner.name}` : winner}
        </Typography>
        {isTeamAward && (
          <Typography
            fontSize="2.5rem"
            color="text.secondary"
          >{`${winner.affiliation.name}, ${winner.affiliation.city}`}</Typography>
        )}
        <Image
          src="/assets/audience-display/sponsors/first-israel-horizontal.svg"
          alt="תמונת ספונסר"
          width={300}
          height={100}
          style={{ position: 'fixed', left: 1920 - 300 - 180, bottom: 80 }}
        />
        <Image
          src="/assets/audience-display/season-logo.svg"
          alt="תמונת ספונסר"
          width={300}
          height={100}
          style={{ position: 'fixed', left: 180, bottom: 80 }}
        />
      </Box>
    </Slide>
  );
};

export default AwardWinnerChromaSlide;
