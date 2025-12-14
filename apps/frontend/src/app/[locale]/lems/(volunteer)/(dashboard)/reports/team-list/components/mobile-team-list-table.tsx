'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Box, Stack, Typography, Chip, useTheme } from '@mui/material';
import { Flag } from '@lems/shared';
import { Team } from '../graphql';

interface MobileTeamListTableProps {
  teams: Team[];
}

export const MobileTeamListTable: React.FC<MobileTeamListTableProps> = ({ teams }) => {
  const t = useTranslations('pages.reports.team-list');
  const theme = useTheme();

  const registeredCount = useMemo(() => teams.filter(t => t.arrived).length, [teams]);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Stack spacing={2} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">
            {t('arrived-count', { count: registeredCount, total: teams.length })}
          </Typography>
        </Box>

        {teams.map(team => (
          <Paper
            key={team.id}
            sx={{
              p: 2,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none'
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  #{team.number} {team.name}
                  <Flag region={team.region} size={20} />
                </Typography>
                <Chip
                  label={team.arrived ? t('arrived') : t('not-arrived')}
                  size="small"
                  color={team.arrived ? 'success' : 'default'}
                  variant={team.arrived ? 'filled' : 'outlined'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {team.affiliation}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {team.city}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
};
