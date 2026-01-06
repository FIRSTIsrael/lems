'use client';

import { Card, CardContent, CardHeader, Chip, Paper, Stack, useTheme, alpha } from '@mui/material';
import { useTranslations } from 'next-intl';
import BlockIcon from '@mui/icons-material/Block';
import type { Team } from '../../graphql/types';
import { TeamInfo } from '../../../components/team-info';

interface DisqualifiedTeamsListProps {
  disqualifiedTeams: Team[];
}

export function DisqualifiedTeamsList({ disqualifiedTeams }: DisqualifiedTeamsListProps) {
  const t = useTranslations('pages.judge-advisor.awards.disqualification');
  const theme = useTheme();

  if (disqualifiedTeams.length === 0) {
    return null;
  }

  return (
    <Card sx={{ borderLeft: `4px solid ${theme.palette.error.main}`, boxShadow: theme.shadows[2] }}>
      <CardHeader
        title={t('disqualified-teams-title')}
        slotProps={{ title: { variant: 'h6', sx: { fontWeight: 600 } } }}
        avatar={<BlockIcon sx={{ color: 'error.main' }} />}
        subheader={t('disqualified-teams-count', { count: disqualifiedTeams.length })}
      />
      <CardContent>
        <Stack spacing={2}>
          {disqualifiedTeams.map(team => (
            <Paper
              key={team.id}
              sx={{
                p: 2,
                backgroundColor: alpha(theme.palette.error.main, 0.05),
                borderLeft: `3px solid ${theme.palette.error.main}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: theme.transitions.create(['all']),
                boxShadow: theme.shadows[1],
                '&:hover': {
                  boxShadow: theme.shadows[2],
                  backgroundColor: alpha(theme.palette.error.main, 0.08)
                },
                gap: 2
              }}
            >
              <TeamInfo team={team} size="sm" />

              <Chip
                icon={<BlockIcon />}
                label={t('disqualified')}
                color="error"
                size="small"
                sx={{ fontWeight: 600, flexShrink: 0 }}
              />
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
