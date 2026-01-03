'use client';

import { useTranslations } from 'next-intl';import {
  CheckCircle,
  WarningAmber,
  HelpOutline,
  Edit,
  Send,
  Diversity1
} from '@mui/icons-material';
import { Box, Badge, Tooltip, Typography, useTheme } from '@mui/material';
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


export const getScoresheetStatusIcon =(status: ScoresheetStatus | 'escalated') => {
  const iconProps = { sx: { fontSize: '1.2rem' } };
  if (status === 'escalated') {
    return <WarningAmber {...iconProps} sx={{ ...iconProps.sx, color: 'warning.main' }} />;
  }

  switch (status) {
    case 'empty':
      return <HelpOutline {...iconProps} color="disabled" />;
    case 'in-progress':
      return <Edit {...iconProps} color="info" />;
    case 'gp':
      return <Diversity1 {...iconProps} color='error' />;
    case 'completed':
    return <CheckCircle {...iconProps} color='success' />;
    case 'submitted':
      return <Send {...iconProps} color="success" />;
    default:
      return null;
  }
}

export const getStatusColor = (status: ScoresheetStatus | 'escalated'): string => {
  if (status === 'escalated') {
    return 'warning.main';
  }
  switch (status) {
    case 'empty':
      return 'text.disabled';
    case 'in-progress':
      return 'info.main'; 
    case 'gp':
      return 'error.main';
    case 'completed':
      return 'success.main';
    case 'submitted':
      return 'success.main';  
    default:
      return 'text.primary';
  }
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
  const theme = useTheme();

  const statusColor = getStatusColor(escalated ? 'escalated' : status);
  const isCompleted = status === 'completed';
  const isDraft = status === 'in-progress';

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
      <Box
      sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.25,
          py: 0.75,
          borderRadius: 1.5,
          backgroundColor:
            isCompleted || isDraft
              ? theme.palette.mode === 'dark'
                ? `${statusColor}20`
                : `${statusColor}12`
              : 'transparent',
          border: '1.5px solid',
          borderColor: statusColor,
          cursor: disabled ? 'default' : 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          width: 'auto',
          opacity: disabled ? 0.5 : 1,
          ...(!disabled && {
            '&:hover': {
              backgroundColor:
                theme.palette.mode === 'dark' ? `${statusColor}30` : `${statusColor}18`,
              boxShadow: `0 2px 8px ${statusColor}30`
            },
            '&:active': {
              transform: 'scale(0.98)'
            }
          })
        }}
      >
        {getScoresheetStatusIcon(escalated ? 'escalated' : status)}
        <Typography variant="caption" sx={{
            fontWeight: 600,
            fontSize: '0.8rem',
            flex: 0,
            color: statusColor
          }}
          >
          #{teamNumber}
        </Typography>
      </Box>
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
