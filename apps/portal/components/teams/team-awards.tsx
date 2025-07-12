import { useTranslations } from 'next-intl';
import { Paper, Typography } from '@mui/material';
import { PortalAward } from '@lems/types';
import AwardWinner from '../events/award-winner';

interface TeamAwardsProps {
  awards: PortalAward[];
}

const TeamAwards: React.FC<TeamAwardsProps> = ({ awards }) => {
  const t = useTranslations('components.teams.team-awards');

  return (
    <Paper sx={{ p: 2, mt: 2, flexGrow: 1 }}>
      <Typography variant="h2" gutterBottom>
        {t('title')}
      </Typography>
      {awards
        .filter(award => award.name !== 'advancement')
        .map((award, index) => (
          <AwardWinner key={index} award={award} />
        ))}
    </Paper>
  );
};

export default TeamAwards;
