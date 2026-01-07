import { Box, Stack, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useFilteredSessions } from '../hooks/use-filtered-sessions';
import { useLeadJudge } from './lead-judge-context';
import { StatusFilterSelector } from './status-filter-selector';

interface SessionFiltersProps {
  teamFilter: string;
  setTeamFilter: (value: string) => void;
  statusFilter: string[];
  setStatusFilter: (value: string[]) => void;
}

export const SessionFilters: React.FC<SessionFiltersProps> = ({
  teamFilter,
  setTeamFilter,
  statusFilter = [],
  setStatusFilter
}) => {
  const t = useTranslations('pages.lead-judge.list');
  const { sessions } = useLeadJudge();

  const filteredSessions = useFilteredSessions(sessions, {
    teamFilter,
    statusFilter
  });

  const sessionStatuses = ['not-started', 'in-progress', 'completed'];

  return (
    <Stack direction={'column'} spacing={1.5}>
      <TextField
        label={t('filter.team')}
        placeholder={t('filter.team-placeholder')}
        value={teamFilter}
        onChange={e => setTeamFilter(e.target.value)}
        size="small"
        sx={{ flex: 1, minWidth: 150 }}
      />
      <StatusFilterSelector
        statuses={sessionStatuses}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      {(teamFilter || statusFilter.length > 0) && (
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <Typography variant="caption" color="textSecondary">
            {t('filter.results')}: <strong>{filteredSessions.length}</strong>
          </Typography>
        </Box>
      )}
    </Stack>
  );
};
