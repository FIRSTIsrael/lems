'use client';

import { useTranslations } from 'next-intl';
import { Box, Badge, Tooltip, ButtonBase, Typography } from '@mui/material';
import Link from 'next/link';
import type { ScoresheetStatus } from '../graphql/types';

export interface ScoresheetStatusButtonProps {
  teamNumber: string;
  teamSlug: string;
  scoresheetSlug: string;
  status: ScoresheetStatus;
  escalated: boolean;
  score?: number;
  gp?: 2 | 3 | 4 | null;
  disabled?: boolean;
}

/**
 * Gets the background color for a scoresheet status.
 * Escalated status overrides all other colors with orange.
 */
export function getScoresheetStatusColor(status: ScoresheetStatus, escalated: boolean): string {
  if (escalated) {
    return '#ff9800'; // Orange
  }

  switch (status) {
    case 'empty':
      return 'transparent';
    case 'draft':
      return '#e0f2fe'; // Light blue
    case 'completed':
      return '#0284c7'; // Blue
    case 'gp':
      return '#4338ca'; // Indigo
    case 'submitted':
      return '#059669'; // Green
    default:
      return 'transparent';
  }
}

/**
 * Gets the border color for empty scoresheets.
 */
function getBorderColor(status: ScoresheetStatus, escalated: boolean): string | undefined {
  if (status === 'empty' && !escalated) {
    return '#9ca3af'; // Gray
  }
  return undefined;
}

/**
 * Gets the GP badge color.
 */
function getGpBadgeColor(gp: 2 | 3 | 4 | null | undefined): 'error' | 'default' | 'primary' {
  if (gp === 2) return 'error'; // Red
  if (gp === 4) return 'primary'; // Blue
  return 'default'; // Gray for 3
}

export function ScoresheetStatusButton({
  teamNumber,
  teamSlug,
  scoresheetSlug,
  status,
  escalated,
  score,
  gp,
  disabled = false
}: ScoresheetStatusButtonProps) {
  const t = useTranslations('pages.head-referee');

  const bgcolor = getScoresheetStatusColor(status, escalated);
  const borderColor = getBorderColor(status, escalated);
  const textColor = status === 'empty' || status === 'draft' ? 'text.primary' : 'white';

  const tooltipTitle = disabled
    ? t('scoresheet-button.team-not-registered')
    : escalated
      ? t('scoresheet-button.escalated-tooltip')
      : t(`scoresheet-status.${status}`);

  const button = (
    <Badge
      badgeContent={score !== undefined ? score : null}
      max={1000}
      color={gp ? getGpBadgeColor(gp) : 'default'}
      sx={{
        '& .MuiBadge-badge': {
          fontSize: '0.65rem',
          height: 18,
          minWidth: 18,
          padding: '0 4px'
        }
      }}
    >
      <ButtonBase
        disabled={disabled}
        sx={{
          minWidth: 50,
          minHeight: 36,
          px: 1.5,
          py: 0.75,
          borderRadius: 1,
          bgcolor,
          border: borderColor ? `2px solid ${borderColor}` : 'none',
          color: textColor,
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'all 0.2s',
          '&:hover': disabled
            ? {}
            : {
                opacity: 0.8,
                transform: 'scale(1.05)'
              },
          '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed'
          }
        }}
      >
        <Typography variant="caption" fontWeight={600}>
          #{teamNumber}
        </Typography>
      </ButtonBase>
    </Badge>
  );

  if (disabled) {
    return (
      <Tooltip title={tooltipTitle} arrow>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Box component={Link} href={`/lems/team/${teamSlug}/scoresheet/${scoresheetSlug}`}>
        {button}
      </Box>
    </Tooltip>
  );
}
