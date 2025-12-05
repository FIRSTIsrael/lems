'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Paper,
  Typography,
  Stack,
  Tooltip,
  IconButton,
  Popover,
  Box,
  useTheme,
  Chip,
  Divider
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useMatchTranslations } from '@lems/localization';
import { Match } from '../scorekeeper.graphql';
import { useScorekeeperData } from '../scorekeeper-context';

interface NextMatchDisplayProps {
  match?: Match | null;
  currentDelay?: string;
}

interface TeamReadiness {
  number: number | undefined;
  name: string;
  status: 'ready' | 'not-ready' | 'no-show' | 'missing' | 'queued';
}

const calculateDelay = (scheduledTime: string): string => {
  const scheduled = new Date(scheduledTime).getTime();
  const now = Date.now();
  const delayMs = now - scheduled;
  const delaySecs = Math.round(delayMs / 1000);

  const sign = delaySecs < 0 ? '-' : '+';
  const absSecs = Math.abs(delaySecs);
  const mins = Math.floor(absSecs / 60);
  const secs = absSecs % 60;

  return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
};

const getStatusIcon = (status: TeamReadiness['status']) => {
  const iconProps = { sx: { fontSize: '1.2rem' } };

  switch (status) {
    case 'ready':
      return <CheckCircleIcon {...iconProps} color="success" />;
    case 'not-ready':
      return <CancelIcon {...iconProps} color="error" />;
    case 'no-show':
      return <BlockIcon {...iconProps} color="error" />;
    case 'queued':
      return <MoreHorizIcon {...iconProps} color="info" />;
    case 'missing':
      return <HelpOutlineIcon {...iconProps} color="disabled" />;
  }
};

const StatusBadge = ({ status }: { status: TeamReadiness['status'] }) => {
  return (
    <Tooltip title={`Status: ${status}`}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {getStatusIcon(status)}
      </Box>
    </Tooltip>
  );
};

export function NextMatchDisplay({ match: propMatch, currentDelay }: NextMatchDisplayProps) {
  const t = useTranslations('pages.scorekeeper.next-match');
  const { getStage } = useMatchTranslations();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Use context value if prop is not provided
  const contextData = useScorekeeperData();
  const match = propMatch ?? contextData.loadedMatch;

  const displayTime = useMemo(() => {
    if (!match?.scheduledTime) return '—';
    return new Date(match.scheduledTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }, [match?.scheduledTime]);

  const displayDelay = useMemo(() => {
    return currentDelay || (match?.scheduledTime ? calculateDelay(match.scheduledTime) : '—');
  }, [match?.scheduledTime, currentDelay]);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);

  if (!match) {
    return (
      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="textSecondary">
          {t('no-match')}
        </Typography>
      </Paper>
    );
  }

  const isOnTime = displayDelay.startsWith('-') || displayDelay.startsWith('+0:');

  return (
    <Paper
      sx={{
        p: 1.75,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Header Row */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Stack spacing={0}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'text.primary'
            }}
          >
            {getStage(match.stage)} #{match.number}
          </Typography>
          {match.round && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.25 }}>
              {t('round')} {match.round}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" gap={0.75} alignItems="center">
          <Chip
            label={displayTime}
            variant="outlined"
            size="small"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              fontWeight: 500
            }}
          />
          <Chip
            label={displayDelay}
            variant="filled"
            size="small"
            color={isOnTime ? 'success' : 'warning'}
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              fontWeight: 500
            }}
          />
          <Tooltip title={t('legend.title')}>
            <IconButton
              size="small"
              onClick={handlePopoverOpen}
              sx={{
                color: theme.palette.text.secondary,
                transition: 'all 0.2s',
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Teams Section */}
      <Stack spacing={0.75} sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: 0.5
          }}
        >
          {t('teams')}
        </Typography>

        <Stack spacing={0.5}>
          {match.participants.map((participant, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 0.75,
                bgcolor: 'action.hover',
                borderRadius: 0.75,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'action.selected'
                }
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <StatusBadge
                  status={
                    participant.team
                      ? ('ready' as TeamReadiness['status'])
                      : ('missing' as TeamReadiness['status'])
                  }
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  T{participant.team?.number || '?'} · {participant.team?.name || 'Unknown'}
                </Typography>
              </Box>

              <Chip
                label={participant.table?.name || 'Unknown'}
                variant="filled"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  marginLeft: 1,
                  flexShrink: 0
                }}
              />
            </Box>
          ))}
        </Stack>
      </Stack>

      {/* Legend Popover */}
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              borderRadius: 2,
              minWidth: 280,
              maxWidth: 320,
              ml: 1,
              mt: 1,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'visible'
            }
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: 12,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: `8px solid ${theme.palette.divider}`
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: -7,
            right: 12,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: `8px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper}`
          }}
        />
        <Box sx={{ p: 2.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: theme.palette.text.primary
            }}
          >
            {t('legend.title')}
          </Typography>

          <Stack spacing={1.5} divider={<Divider />}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 0.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 24,
                  pt: 0.25
                }}
              >
                <CheckCircleIcon sx={{ fontSize: '1.2rem', color: theme.palette.success.main }} />
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.25
                  }}
                >
                  {t('statuses.ready')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.4
                  }}
                >
                  {t('legend.ready')}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 0.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 24,
                  pt: 0.25
                }}
              >
                <CancelIcon sx={{ fontSize: '1.2rem', color: theme.palette.error.main }} />
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.25
                  }}
                >
                  {t('statuses.not-ready')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.4
                  }}
                >
                  {t('legend.not-ready')}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 0.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 24,
                  pt: 0.25
                }}
              >
                <BlockIcon sx={{ fontSize: '1.2rem', color: theme.palette.error.main }} />
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.25
                  }}
                >
                  {t('statuses.no-show')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.4
                  }}
                >
                  {t('legend.no-show')}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 0.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 24,
                  pt: 0.25
                }}
              >
                <MoreHorizIcon sx={{ fontSize: '1.2rem', color: theme.palette.info.main }} />
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.25
                  }}
                >
                  {t('statuses.queued')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.4
                  }}
                >
                  {t('legend.queued')}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 0.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 24,
                  pt: 0.25
                }}
              >
                <HelpOutlineIcon sx={{ fontSize: '1.2rem', color: theme.palette.text.disabled }} />
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.25
                  }}
                >
                  {t('statuses.missing')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.4
                  }}
                >
                  {t('legend.missing')}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </Paper>
  );
}
