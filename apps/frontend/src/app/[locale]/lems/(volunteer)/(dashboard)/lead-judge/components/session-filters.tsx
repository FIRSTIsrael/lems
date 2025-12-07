import { Box, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { useFilter } from "../hooks/use-filter";
import { JudgingSessionAdvisor } from "../lead-judge.graphql";

export const SessionFilters : React.FC<{
  sessions: JudgingSessionAdvisor[];
}> = ({sessions}) => {
  const t = useTranslations('pages.lead-judge.list');
  const {teamFilter, setTeamFilter, statusFilter, setStatusFilter, sortedAndFilteredSessions} = useFilter(sessions);
  
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
      <TextField
        select
        label={t('filter.status')}
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value)}
        size="small"
        sx={{ flex: 1, minWidth: 150 }}
      >
        <MenuItem value="">{t('filter.all-statuses')}</MenuItem>
        <MenuItem value="not-started">{t('session-status.not-started')}</MenuItem>
        <MenuItem value="in-progress">{t('session-status.in-progress')}</MenuItem>
        <MenuItem value="completed">{t('session-status.completed')}</MenuItem>
      </TextField>
      {(teamFilter || statusFilter) && (
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <Typography variant="caption" color="textSecondary">
            {t('filter.results')}: <strong>{sortedAndFilteredSessions.length}</strong>
          </Typography>
        </Box>
      )}
    </Stack>
  )
}