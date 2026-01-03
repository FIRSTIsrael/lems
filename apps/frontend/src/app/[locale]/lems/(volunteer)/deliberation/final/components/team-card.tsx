'use client';

import { Paper, Box, Stack, Typography, Checkbox, useTheme, alpha, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { DeliberationTeam } from '../lib/types';

interface TeamCardProps {
  team: DeliberationTeam;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  showRanks?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  selected = false,
  onSelect,
  showRanks = true,
  disabled = false,
  children
}) => {
  const theme = useTheme();
  const t = useTranslations('deliberations.final.teamCard');

  return (
    <Paper
      sx={{
        p: 2,
        mb: 1.5,
        cursor: onSelect ? 'pointer' : 'default',
        border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        backgroundColor: selected ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover':
          onSelect && !disabled
            ? {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                borderColor: theme.palette.primary.main
              }
            : {},
        opacity: disabled ? 0.6 : 1
      }}
      onClick={() => onSelect && !disabled && onSelect(!selected)}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {/* Checkbox */}
        {onSelect && (
          <Box sx={{ pt: 0.5 }}>
            <Checkbox
              checked={selected}
              onChange={e => onSelect(e.target.checked)}
              disabled={disabled}
              size="small"
            />
          </Box>
        )}

        {/* Team Info */}
        <Stack flex={1} spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {team.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              #{team.number}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" color="textSecondary">
              {team.affiliation}
            </Typography>
            {team.city && (
              <Typography variant="caption" color="textSecondary">
                {team.city}
              </Typography>
            )}
          </Stack>

          {/* Rankings */}
          {showRanks && (
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Tooltip title={t('totalRank')}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                  >
                    #{team.totalRank}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('overall')}
                  </Typography>
                </Box>
              </Tooltip>

              <Typography variant="caption" color="textSecondary">
                •
              </Typography>

              <Tooltip title={t('robotGameRank')}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    #{team.ranks['robot-game']}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('robotGame')}
                  </Typography>
                </Box>
              </Tooltip>
            </Stack>
          )}
        </Stack>

        {/* Custom Content */}
        {children && <Box sx={{ flexShrink: 0 }}>{children}</Box>}
      </Stack>
    </Paper>
  );
};
