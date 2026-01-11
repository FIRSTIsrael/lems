'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Paper, Stack, Typography, alpha, useTheme, IconButton, Tooltip } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/database';
import { Award } from '@lems/shared';
import { useFinalDeliberation } from '../../final-deliberation-context';
import type { EnrichedTeam } from '../../types';

const CATEGORIES: JudgingCategory[] = ['robot-design', 'innovation-project', 'core-values'];

interface AwardListItemProps {
  team: EnrichedTeam | null;
  index: number;
  onRemove: () => void;
}

const AwardListItem: React.FC<AwardListItemProps> = ({ team, index, onRemove }) => {
  const theme = useTheme();

  if (!team) {
    return (
      <Paper
        sx={{
          p: '0.4rem 0.6rem',
          textAlign: 'center',
          color: 'text.disabled',
          bgcolor: alpha(theme.palette.action.hover, 0.3),
          borderRadius: 0.5,
          fontSize: '0.75rem',
          minHeight: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {index + 1}
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: '0.4rem 0.6rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 0.5,
        minHeight: '28px',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease',
        backgroundColor: 'transparent',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          borderColor: theme.palette.primary.main,
          boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.1)}`
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          flex: 1,
          minWidth: 0
        }}
      >
        <Box
          sx={{
            minWidth: '18px',
            textAlign: 'center',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: theme.palette.text.secondary,
            flexShrink: 0
          }}
        >
          {index + 1}
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {team.number} | {team.name}
        </Typography>
      </Box>
      <Tooltip title="Remove">
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{ color: theme.palette.error.main, flexShrink: 0, p: '0.25rem' }}
        >
          <Close sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export const CoreAwardsAwardLists: React.FC = () => {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.final.core-awards');
  const { getCategory } = useJudgingCategoryTranslations();
  const { teams, awards, awardCounts, updateAward } = useFinalDeliberation();

  const handleRemoveAward = useCallback(
    async (category: JudgingCategory, index: number) => {
      const currentAwards = awards[category] || [];
      const updated = currentAwards.filter((_, i) => i !== index);
      await updateAward(category, updated);
    },
    [awards, updateAward]
  );

  const categoryAwards = useMemo(
    () =>
      CATEGORIES.reduce(
        (acc, category) => {
          const awardTeamIds = awards[category] || [];
          const awardTeams = awardTeamIds.map(teamId => teams.find(t => t.id === teamId));
          acc[category] = awardTeams;
          return acc;
        },
        {} as Record<JudgingCategory, (EnrichedTeam | undefined)[]>
      ),
    [awards, teams]
  );

  return (
    <Stack spacing={2} sx={{ width: '100%', height: '100%' }}>
      {CATEGORIES.map(category => (
        <Paper
          key={category}
          sx={{
            flex: 1,
            minHeight: 0,
            p: 1.5,
            borderRadius: 1.5,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
          }}
        >
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '0.875rem'
              }}
            >
              {getCategory(category)} ({categoryAwards[category].length}/
              {awardCounts[category as Award] ?? 0})
            </Typography>
          </Box>

          <Stack
            spacing={0.5}
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              pr: 0.5,
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: alpha(theme.palette.action.hover, 0.3),
                borderRadius: 1
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(theme.palette.action.active, 0.5),
                borderRadius: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.active, 0.7)
                }
              }
            }}
          >
            {categoryAwards[category].length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.disabled',
                  textAlign: 'center'
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {t('select-team')}
                </Typography>
              </Box>
            ) : (
              categoryAwards[category].map((team, index) => (
                <AwardListItem
                  key={`${category}-${index}`}
                  team={team || null}
                  index={index}
                  onRemove={() => handleRemoveAward(category, index)}
                />
              ))
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};
