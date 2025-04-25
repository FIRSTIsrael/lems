import { Typography, Stack } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import {
  CoreValuesAwards,
  CoreValuesAwardsTypes,
  PersonalAwards,
  PersonalAwardTypes,
  PortalAward
} from '@lems/types';
import { getColorByPlace } from '../../lib/styling';

interface AwardWinnerProps {
  award: PortalAward;
  winnerText: string;
}

const AwardWinner: React.FC<AwardWinnerProps> = ({ award, winnerText }) => {
  const showTrophys = ![...CoreValuesAwardsTypes, ...PersonalAwardTypes].includes(
    award.name as CoreValuesAwards | PersonalAwards
  );

  return (
    <Stack direction="row" spacing={1} mt={1}>
      {typeof award.winner === 'string' ? (
        <Typography variant="body1">{winnerText}</Typography>
      ) : (
        <>
          {showTrophys && <EmojiEventsIcon sx={{ mr: 1, color: getColorByPlace(award.place) }} />}
          <Typography variant="body1">{winnerText}</Typography>
        </>
      )}
    </Stack>
  );
};

export default AwardWinner;
