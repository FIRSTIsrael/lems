'use client';

import { Paper, Stack, Typography, Box, Alert, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { DeliberationTeam } from '../lib/types';
import { TeamCard } from './team-card';

interface ChampionsDeliberationProps {
  teams: DeliberationTeam[];
  allTeams: DeliberationTeam[];
  selectedAwards: string[];
  onSelectTeam: (teamId: string, selected: boolean) => void;
  disabled?: boolean;
}

const CHAMPION_PLACES = ['1st', '2nd', '3rd', '4th'] as const;

export const ChampionsDeliberation: React.FC<ChampionsDeliberationProps> = ({
  teams,
  allTeams,
  selectedAwards,
  onSelectTeam,
  disabled = false
}) => {
  const t = useTranslations('deliberations.final.champions');
  const theme = useTheme();

  // Get robot performance winners (top teams by robot game score)
  const robotPerformanceWinners = allTeams
    .sort((a, b) => b.ranks['robot-game'] - a.ranks['robot-game'])
    .slice(0, Math.min(3, allTeams.length)); // Assume up to 3 robot performance awards

  return (
    <Stack spacing={3}>
      {/* Instructions */}
      <Alert severity="info">{t('instruction')}</Alert>

      {/* Champions Selection */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('championsTitle')}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {t('eligibleTeams', { count: teams.length })}
        </Typography>

        {teams.length === 0 ? (
          <Alert severity="warning">{t('noEligibleTeams')}</Alert>
        ) : (
          <Stack spacing={1}>
            {teams.map(team => (
              <Box key={team.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                {/* Team Card taking full width */}
                <Box sx={{ flex: 1 }}>
                  <TeamCard
                    team={team}
                    selected={selectedAwards.includes(team.id)}
                    onSelect={selected => onSelectTeam(team.id, selected)}
                    disabled={disabled}
                  />
                </Box>

                {/* Place indicator */}
                {selectedAwards.includes(team.id) && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 60,
                      height: 60,
                      borderRadius: 1,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.25rem'
                    }}
                  >
                    {CHAMPION_PLACES[selectedAwards.indexOf(team.id)]}
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Robot Performance */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('robotPerformanceTitle')}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {t('robotPerformanceDescription')}
        </Typography>

        <Stack spacing={1}>
          {robotPerformanceWinners.map((team, index) => (
            <Paper
              key={team.id}
              sx={{
                p: 2,
                backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2a2a2a',
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 700
                  }}
                >
                  {index + 1}
                </Box>
                <Stack flex={1} spacing={0.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {team.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    #{team.number} • {team.affiliation}
                  </Typography>
                </Stack>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {team.highestGpScore}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('maxScore')}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
};
