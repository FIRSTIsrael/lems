'use client';

import { Paper, Stack, Typography, Box, Alert, Checkbox, FormControlLabel } from '@mui/material';
import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { DeliberationTeam } from '../lib/types';
import { TeamCard } from './team-card';

interface OptionalAwardsDeliberationProps {
  teams: DeliberationTeam[];
  selectedAwards: Record<string, string[]>;
  onSelectTeam: (awardName: string, teamId: string, selected: boolean) => void;
  disabled?: boolean;
}

export const OptionalAwardsDeliberation: React.FC<OptionalAwardsDeliberationProps> = ({
  teams,
  selectedAwards,
  onSelectTeam,
  disabled = false
}) => {
  const t = useTranslations('deliberations.final.optionalAwards');
  const [selectedAwardFilter, setSelectedAwardFilter] = useState<string | null>(null);

  // Get all unique optional awards nominated
  const availableAwards = useMemo(() => {
    const awards = new Set<string>();
    teams.forEach(team => {
      Object.keys(team.optionalAwardNominations || {}).forEach(award => {
        if (team.optionalAwardNominations[award]) {
          awards.add(award);
        }
      });
    });
    return Array.from(awards).sort();
  }, [teams]);

  // Filter teams by selected award
  const filteredTeams = useMemo(() => {
    if (!selectedAwardFilter) return teams;
    return teams.filter(team => team.optionalAwardNominations?.[selectedAwardFilter]);
  }, [teams, selectedAwardFilter]);

  return (
    <Stack spacing={3}>
      {/* Instructions */}
      <Alert severity="info">{t('instruction')}</Alert>

      {/* Award Filter */}
      {availableAwards.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            {t('filterByAward')}
          </Typography>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedAwardFilter === null}
                  onChange={() => setSelectedAwardFilter(null)}
                  disabled={disabled}
                />
              }
              label={t('allAwards')}
            />
            {availableAwards.map(award => (
              <FormControlLabel
                key={award}
                control={
                  <Checkbox
                    checked={selectedAwardFilter === award}
                    onChange={() => setSelectedAwardFilter(award)}
                    disabled={disabled}
                  />
                }
                label={award}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Teams */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {selectedAwardFilter
            ? t('teamsNominatedFor', { award: selectedAwardFilter })
            : t('nominatedTeams')}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {t('eligibleTeams', { count: filteredTeams.length })}
        </Typography>

        {filteredTeams.length === 0 ? (
          <Alert severity="warning">{t('noEligibleTeams')}</Alert>
        ) : (
          <Stack spacing={1}>
            {filteredTeams.map(team => (
              <Box key={team.id}>
                <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.entries(team.optionalAwardNominations || {})
                    .filter(([, nominated]) => nominated)
                    .map(([award]) => (
                      <Box
                        key={award}
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: 'primary.light',
                          color: 'primary.dark',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {award}
                      </Box>
                    ))}
                </Box>

                <TeamCard
                  team={team}
                  selected={Object.values(selectedAwards).some(winners =>
                    winners.includes(team.id)
                  )}
                  onSelect={selected => {
                    // Select/deselect from all applicable awards
                    Object.entries(team.optionalAwardNominations || {})
                      .filter(([, nominated]) => nominated)
                      .forEach(([award]) => {
                        onSelectTeam(award, team.id, selected);
                      });
                  }}
                  disabled={disabled}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Summary */}
      {Object.keys(selectedAwards).length > 0 && (
        <Paper sx={{ p: 3, backgroundColor: 'action.hover' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            {t('selectedWinners')}
          </Typography>
          <Stack spacing={1}>
            {availableAwards.map(award => {
              const awarded = selectedAwards[award] || [];
              return (
                <Box key={award}>
                  <Typography variant="caption" color="textSecondary">
                    <strong>{award}:</strong>{' '}
                    {awarded.length > 0
                      ? awarded.map(teamId => teams.find(t => t.id === teamId)?.name).join(', ')
                      : t('none')}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};
