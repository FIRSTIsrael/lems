import { Paper, Typography } from '@mui/material';
import { PortalAward } from '@lems/types';
import { localizedAward, localizedAwardPlace } from '@lems/season';
import AwardWinner from '../events/award-winner';
import { useTranslations } from 'next-intl';

interface TeamAwardsProps {
  awards: PortalAward[];
}

const TeamAwards: React.FC<TeamAwardsProps> = ({ awards }) => {
  const t = useTranslations('components:teams:team-awards');

  return (
    <Paper sx={{ p: 2, mt: 2, flexGrow: 1 }}>
      <Typography variant="h2" gutterBottom>
        {t('title')}
      </Typography>
      {awards
        .filter(award => award.name !== 'advancement')
        .map((award, index) => (
          <AwardWinner
            key={index}
            award={award}
            winnerText={`${localizedAward[award.name].name}, מקום ${localizedAwardPlace[award.place]}`}
          />
        ))}
    </Paper>
  );
};

export default TeamAwards;
