'use client';

import { useTranslations } from 'next-intl';
import {
  Paper,
  Box,
  Typography,
  useTheme,
  Stack
} from '@mui/material';
import { JudgingSessionAdvisor } from '../lead-judge.graphql';
import { JudgingCategory } from '@lems/types/judging';
import { TeamSessionCard } from './team-session-card';
import { useFilter } from '../hooks/use-filter';

interface RubricStatusListProps {
  sessions: JudgingSessionAdvisor[];
  category: JudgingCategory;
  loading?: boolean;
}

export const RubricStatusList: React.FC<RubricStatusListProps> = ({
  sessions,
  category,
  loading = false
}) => {
  const t = useTranslations('pages.lead-judge.list');
  const theme = useTheme();

  const {sortedAndFilteredSessions} = useFilter(sessions);

  if (loading) {
    return (
      <Box>
        <Box sx={{ height: 40, bgcolor: 'action.disabledBackground', borderRadius: 1, mb: 2 }} />
        <Stack spacing={2}>
          {[1, 2, 3].map(i => (
            <Box
              key={i}
              sx={{ height: 120, bgcolor: 'action.disabledBackground', borderRadius: 1 }}
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
    <Box
      sx={{
        maxHeight: 'calc(100vh - 300px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        pr: 1,
        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
          }
        }
      }}
    >
      <Stack spacing={1.5}>
        {sortedAndFilteredSessions.map(session => (
          <TeamSessionCard
            key={session.id}
            session={session}
            category={category}
          />
        ))}
      </Stack>
    </Box>
  );
};
