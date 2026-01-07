'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  CheckCircle,
  WarningAmber,
  HelpOutline,
  Edit,
  Send,
  Diversity1
} from '@mui/icons-material';
import { Box, Tooltip, Typography, useTheme } from '@mui/material';
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
  dimmed?: boolean;
}

export const getScoresheetStatusIcon = (status: ScoresheetStatus | 'escalated') => {
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
      return <Diversity1 {...iconProps} color="error" />;
    case 'completed':
      return <CheckCircle {...iconProps} color="success" />;
    case 'submitted':
      return <Send {...iconProps} color="success" />;
    default:
      return null;
  }
};

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
};

export function ScoresheetStatusButton({
  teamNumber,
  teamSlug,
  scoresheetSlug,
  status,
  escalated,
  score,
  gp,
  disabled = false,
  dimmed = false
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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        gap: 0.75,
        px: 1.5,
        py: 1,
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
        minWidth: 'max-content',
        opacity: disabled ? 0.5 : dimmed ? 0.35 : 1,
        filter: dimmed ? 'grayscale(0.7)' : 'none',
        ...(!disabled &&
          !dimmed && {
            '&:hover': {
              backgroundColor:
                theme.palette.mode === 'dark' ? `${statusColor}30` : `${statusColor}18`,
              boxShadow: `0 2px 8px ${statusColor}30`,
              transform: 'translateY(-1px)'
            },
            '&:active': {
              transform: 'scale(0.98)'
            }
          })
      }}
    >
      {getScoresheetStatusIcon(escalated ? 'escalated' : status)}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.8rem',
            lineHeight: 1,
            color: statusColor,
            textDecoration: 'none'
          }}
        >
          #{teamNumber}
        </Typography>
        {(score !== undefined || gp) && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              fontSize: '0.7rem',
              lineHeight: 1,
              color: statusColor,
              textDecoration: 'none'
            }}
          >
            {score !== undefined ? score : '-'} {gp ? `(${gp})` : ''}
          </Typography>
        )}
      </Box>
    </Box>
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
      <Box
        component={Link}
        href={`/lems/team/${teamSlug}/scoresheet/${scoresheetSlug}`}
        style={{ textDecoration: 'none' }}
      >
        {button}
      </Box>
    </Tooltip>
  );
}
