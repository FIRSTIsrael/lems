'use client';

import { useTranslations } from 'next-intl';
import { range } from '@lems/shared/utils';
import { Paper, Box, Typography, useTheme, Stack } from '@mui/material';
import { useFilteredSessions } from '../hooks/use-filtered-sessions';
import { useLeadJudge } from './lead-judge-context';
import { TeamSessionCard } from './team-session-card';

interface RubricStatusListProps {
  teamFilter: string;
  statusFilter: string[];
}

export const RubricStatusList: React.FC<RubricStatusListProps> = ({
  teamFilter = '',
  statusFilter = []
}) => {
  const t = useTranslations('pages.lead-judge.list');
  const theme = useTheme();

  const { sessions, category, loading } = useLeadJudge();

  const filteredSessions = useFilteredSessions(sessions, {
    teamFilter,
    statusFilter
  });

  if (loading) {
    return (
      <Box>
        <Stack spacing={2}>
          {range(5).map(i => (
            <Box
              key={i}
              sx={{ height: 80, bgcolor: 'action.disabledBackground', borderRadius: 1 }}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  if (sessions.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography color="textSecondary">{t('empty-state')}</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: 2,
        height: 'calc(100vh - 300px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        p: 2,
        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
          }
        }
      }}
    >
      <Stack spacing={1.5}>
        {filteredSessions.map(session => (
          <TeamSessionCard key={session.id} session={session} category={category} />
        ))}
      </Stack>
    </Paper>
  );
};
