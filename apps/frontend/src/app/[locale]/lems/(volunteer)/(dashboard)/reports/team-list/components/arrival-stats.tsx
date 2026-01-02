'use client';

import { useTranslations } from 'next-intl';
import { Stack, Paper, Typography, useTheme } from '@mui/material';
import { Team } from '../graphql';

interface ArrivalStatsProps {
  teams: Team[];
}

export const ArrivalStats: React.FC<ArrivalStatsProps> = ({ teams }) => {
  const t = useTranslations('pages.reports.team-list');
  const theme = useTheme();

  const registeredCount = teams.filter(t => t.arrived).length;

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} display={{ xs: 'none', md: 'flex' }}>
      <Paper
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          {teams.length}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('total-teams')}
        </Typography>
      </Paper>

      <Paper
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: theme.palette.success.main
          }}
        >
          {registeredCount}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('arrived-teams')}
        </Typography>
      </Paper>

      <Paper
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color:
              teams.length === registeredCount
                ? theme.palette.success.main
                : theme.palette.warning.main
          }}
        >
          {teams.length - registeredCount}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('pending-teams')}
        </Typography>
      </Paper>
    </Stack>
  );
};
