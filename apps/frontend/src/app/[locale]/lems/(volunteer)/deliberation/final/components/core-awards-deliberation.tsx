'use client';

import { Paper, Stack, Typography, Tabs, Tab, Box, Alert } from '@mui/material';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DeliberationTeam } from '../lib/types';
import { TeamCard } from './team-card';

interface CoreAwardsDeliberationProps {
  teams: DeliberationTeam[];
  selectedAwards: Record<string, string[]>;
  onSelectTeam: (awardName: string, teamId: string, selected: boolean) => void;
  disabled?: boolean;
}

const JUDGING_CATEGORIES = ['innovation-project', 'robot-design', 'core-values'] as const;

export const CoreAwardsDeliberation: React.FC<CoreAwardsDeliberationProps> = ({
  teams,
  selectedAwards,
  onSelectTeam,
  disabled = false
}) => {
  const t = useTranslations('deliberations.final.coreAwards');
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof JUDGING_CATEGORIES)[number]>('innovation-project');

  const categoryAwarded = selectedAwards[selectedCategory] || [];

  return (
    <Stack spacing={3}>
      {/* Instructions */}
      <Alert severity="info">{t('instruction')}</Alert>

      {/* Category Tabs */}
      <Paper sx={{ p: 2 }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, newValue) => setSelectedCategory(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {JUDGING_CATEGORIES.map(category => (
            <Tab
              key={category}
              label={t(`categories.${category}`)}
              value={category}
              disabled={disabled}
            />
          ))}
        </Tabs>

        {/* Category Content */}
        <Box sx={{ pt: 3 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {t('selectWinners', { category: selectedCategory })}
          </Typography>

          {teams.length === 0 ? (
            <Alert severity="warning">{t('noEligibleTeams')}</Alert>
          ) : (
            <Stack spacing={1}>
              {teams.map(team => (
                <TeamCard
                  key={team.id}
                  team={team}
                  selected={categoryAwarded.includes(team.id)}
                  onSelect={selected => onSelectTeam(selectedCategory, team.id, selected)}
                  disabled={disabled}
                  showRanks={true}
                >
                  {/* Show rank for current category */}
                  <Box sx={{ textAlign: 'right', minWidth: 60 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      #{team.ranks[selectedCategory] || '-'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {t('rank')}
                    </Typography>
                  </Box>
                </TeamCard>
              ))}
            </Stack>
          )}
        </Box>
      </Paper>

      {/* Summary */}
      <Paper sx={{ p: 3, backgroundColor: 'action.hover' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          {t('selectedWinners')}
        </Typography>
        <Stack spacing={1}>
          {JUDGING_CATEGORIES.map(category => {
            const awarded = selectedAwards[category] || [];
            return (
              <Box key={category}>
                <Typography variant="caption" color="textSecondary">
                  {t(`categories.${category}`)}:{' '}
                  {awarded.length > 0
                    ? awarded.map(teamId => teams.find(t => t.id === teamId)?.name).join(', ')
                    : t('none')}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Paper>
    </Stack>
  );
};
