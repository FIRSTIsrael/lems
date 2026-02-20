'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Paper, Stack, Typography, alpha, useTheme, IconButton, Tooltip } from '@mui/material';
import { Close } from '@mui/icons-material';
import { Award } from '@lems/shared';
import { useAwardTranslations } from '@lems/localization';
import { useFinalDeliberation } from '../../final-deliberation-context';
import type { EnrichedTeam } from '../../types';

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

export const OptionalAwardsAwardLists: React.FC = () => {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.final.optional-awards');
  const { teams, awards, awardCounts, updateAward, deliberationAwards } = useFinalDeliberation();
  const { getName } = useAwardTranslations();

  const handleRemoveAward = useCallback(
    async (award: Award, index: number) => {
      const currentAwards = (awards[award] ?? []) as string[];
      const updated = currentAwards.filter((_: string, i: number) => i !== index);
      await updateAward(award, updated);
    },
    [awards, updateAward]
  );

  // Filter out excellence-in-engineering from optional awards
  const displayedAwards = useMemo(
    () =>
      deliberationAwards
        .filter(
          award =>
            award.isOptional &&
            award.name !== 'excellence-in-engineering' &&
            (awardCounts[award.name as Award] ?? 0) > 0
        )
        .map(award => award.name as Award),
    [awardCounts, deliberationAwards]
  );

  const awardSelections = useMemo(
    () =>
      displayedAwards.reduce(
        (acc, award) => {
          const awardTeamIds = (awards[award] ?? []) as string[];
          const awardTeams = awardTeamIds.map(teamId => teams.find(t => t.id === teamId));
          acc[award] = awardTeams;
          return acc;
        },
        {} as Record<Award, (EnrichedTeam | undefined)[]>
      ),
    [awards, teams, displayedAwards]
  );

  return (
    <Stack spacing={1.5} sx={{ width: '100%', height: '100%' }}>
      {displayedAwards.map(award => (
        <Paper
          key={award}
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
                fontSize: '0.875rem',
                textTransform: 'capitalize'
              }}
            >
              {getName(award)} ({awardSelections[award].length}/{awardCounts[award] ?? 0})
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
            {awardSelections[award].length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.disabled',
                  fontSize: '0.75rem'
                }}
              >
                {t('no-data-available')}
              </Box>
            ) : (
              awardSelections[award].map((team, index) => (
                <AwardListItem
                  key={team?.id || index}
                  team={team || null}
                  index={index}
                  onRemove={() => handleRemoveAward(award, index)}
                />
              ))
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};
