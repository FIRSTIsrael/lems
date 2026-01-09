'use client';

import { Chip, Stack } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import BlockIcon from '@mui/icons-material/Block';
import { useTranslations } from 'next-intl';
import { Team } from '../graphql';
import { TeamInfo } from '../../components/team-info';
import { useJudgeAdvisor } from './judge-advisor-context';

interface TeamInfoCellProps {
  team: Team;
}

export const TeamInfoCell: React.FC<TeamInfoCellProps> = ({ team }) => {
  const t = useTranslations('pages.judge-advisor.team-info-cell');
  const { disqualifiedTeams } = useJudgeAdvisor();
  const isDisqualified = disqualifiedTeams.has(team.id);

  return (
    <Stack spacing={1} sx={{ minWidth: 200 }}>
      <TeamInfo team={team} size="sm" />
      {isDisqualified && (
        <Chip
          icon={<BlockIcon />}
          label={t('disqualified')}
          color="error"
          variant="outlined"
          size="small"
          sx={{ width: 'fit-content', fontWeight: 600, p: 1 }}
        />
      )}
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
