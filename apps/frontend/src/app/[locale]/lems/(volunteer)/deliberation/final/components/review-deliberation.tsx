'use client';

import { Paper, Stack, Typography, Box, Divider, Alert } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { DeliberationTeam } from '../lib/types';

interface ReviewDeliberationProps {
  teams: DeliberationTeam[];
  selectedAwards: Record<string, string[]>;
}

const CORE_AWARD_CATEGORIES = [
  'innovation-project',
  'robot-design',
  'core-values',
  'robot-performance'
] as const;

export const ReviewDeliberation: React.FC<ReviewDeliberationProps> = ({
  teams,
  selectedAwards
}) => {
  const t = useTranslations('deliberations.final.review');

  const getTeamName = (teamId: string): string => {
    return teams.find(t => t.id === teamId)?.name || '???';
  };

  return (
    <Stack spacing={3}>
      {/* Instructions */}
      <Alert severity="info">{t('instruction')}</Alert>

      {/* Summary */}
      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Champions */}
          {selectedAwards['champions'] && selectedAwards['champions'].length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
                🏆 {t('champions')}
              </Typography>
              <Stack spacing={1} sx={{ ml: 2 }}>
                {['1st', '2nd', '3rd', '4th'].map((place, index) => {
                  const teamId = selectedAwards['champions']?.[index];
                  if (!teamId) return null;
                  return (
                    <Box
                      key={place}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="body2">
                        {place} {t('place')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getTeamName(teamId)}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}

          <Divider />

          {/* Core Awards */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
              ⭐ {t('coreAwards')}
            </Typography>
            <Stack spacing={2} sx={{ ml: 2 }}>
              {CORE_AWARD_CATEGORIES.map(category => {
                const winners = selectedAwards[category] || [];
                if (winners.length === 0) return null;
                return (
                  <Box key={category}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {t(`categories.${category}`)}
                    </Typography>
                    <Stack spacing={0.5} sx={{ ml: 1 }}>
                      {winners.map(teamId => (
                        <Typography key={teamId} variant="body2">
                          • {getTeamName(teamId)}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Optional Awards */}
          {Object.keys(selectedAwards).some(
            key =>
              !(CORE_AWARD_CATEGORIES as unknown as string[]).includes(key) &&
              key !== 'champions' &&
              selectedAwards[key].length > 0
          ) && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
                  🎖️ {t('optionalAwards')}
                </Typography>
                <Stack spacing={2} sx={{ ml: 2 }}>
                  {Object.entries(selectedAwards)
                    .filter(
                      ([key, winners]) =>
                        !(CORE_AWARD_CATEGORIES as unknown as string[]).includes(key) &&
                        key !== 'champions' &&
                        winners.length > 0
                    )
                    .map(([awardName, winners]) => (
                      <Box key={awardName}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {awardName}
                        </Typography>
                        <Stack spacing={0.5} sx={{ ml: 1 }}>
                          {winners.map(teamId => (
                            <Typography key={teamId} variant="body2">
                              • {getTeamName(teamId)}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    ))}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </Paper>

      {/* Finalization Notice */}
      <Alert severity="warning">{t('finalizationWarning')}</Alert>
    </Stack>
  );
};
