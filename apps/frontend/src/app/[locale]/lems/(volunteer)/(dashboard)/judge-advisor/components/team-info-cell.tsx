'use client';

import { Chip, Stack } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranslations } from 'next-intl';
import { Team } from '../judge-advisor.graphql';
import { TeamInfo } from '../../components/team-info';

interface TeamInfoCellProps {
  team: Team;
}

export const TeamInfoCell: React.FC<TeamInfoCellProps> = ({ team }) => {
  const t = useTranslations('pages.judge-advisor.team-info-cell');

  return (
    <Stack spacing={1} sx={{ minWidth: 200 }}>
      <TeamInfo team={team} size="sm" />
      {!team.arrived && (
        <Chip
          icon={<WarningIcon />}
          label={t('not-arrived')}
          color="warning"
          variant="outlined"
          size="small"
          sx={{ width: 'fit-content', fontWeight: 600, p: 1 }}
        />
      )}
    </Stack>
  );
};
