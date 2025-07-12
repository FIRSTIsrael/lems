import { Typography, Stack } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useTranslations } from 'next-intl';
import {
  CoreValuesAwards,
  CoreValuesAwardsTypes,
  PersonalAwards,
  PersonalAwardTypes,
  PortalAward,
  PortalTeam
} from '@lems/types';
import { getColorByPlace } from '../../lib/styling';
import { useLocaleAwardName } from '../../locale/hooks/use-locale-award';
interface AwardWinnerProps {
  award: PortalAward;
  /**
   * Whether to show the winner's name or just the award name and place.
   * Defaults to true.
   */
  showWinner?: boolean;
}

const AwardWinner: React.FC<AwardWinnerProps> = ({ award, showWinner = true }) => {
  const t = useTranslations('components.events.award-winner');
  const awardNameToText = useLocaleAwardName();

  const isTeamAward = typeof award.winner !== 'string';
  const winnerText: string = isTeamAward
    ? `${(award.winner as PortalTeam).name} #${(award.winner as PortalTeam).number}`
    : (award.winner as string);

  const showTrophys = ![...CoreValuesAwardsTypes, ...PersonalAwardTypes].includes(
    award.name as CoreValuesAwards | PersonalAwards
  );

  return (
    <Stack direction="row" spacing={1} mt={1}>
      {typeof award.winner === 'string' ? (
        <Typography variant="body1">{award.winner}</Typography>
      ) : (
        <>
          {showTrophys && <EmojiEventsIcon sx={{ mr: 1, color: getColorByPlace(award.place) }} />}
          <Typography variant="body1">
            {showWinner && winnerText}
            {!showWinner && t('award.name', { name: awardNameToText(award.name) })}
            {!showWinner && showTrophys && t('award.place', { place: award.place })}
          </Typography>
        </>
      )}
    </Stack>
  );
};

export default AwardWinner;
