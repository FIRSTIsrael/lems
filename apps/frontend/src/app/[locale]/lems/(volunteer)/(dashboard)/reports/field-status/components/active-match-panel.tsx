'use client';

import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Paper, Stack, Typography, Chip, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BlockIcon from '@mui/icons-material/Block';
import { useMatchTranslations } from '@lems/localization';

type TeamReadinessStatus = 'ready' | 'present' | 'queued' | 'missing' | 'no-show';

interface Participant {
  id: string;
  team?: {
    id: string;
    number: number;
    name: string;
    arrived: boolean;
  } | null;
  table: {
    id: string;
    name: string;
  };
  queued: boolean;
  present: boolean;
  ready: boolean;
}

interface Match {
  id: string;
  slug: string;
  stage: string;
  round: number;
  number: number;
  scheduledTime: string;
  status: string;
  startTime?: string | null;
  startDelta?: number | null;
  participants: Participant[];
}

interface ActiveMatchPanelProps {
  match: Match | null;
  matchLength?: number;
}

function getParticipantStatus(participant: Participant): TeamReadinessStatus {
  if (!participant.team) return 'missing';
  if (!participant.team.arrived) return 'no-show';
  if (participant.ready) return 'ready';
  if (participant.present) return 'present';
  if (participant.queued) return 'queued';
  return 'missing';
}

function getStatusBorderColor(status: TeamReadinessStatus): string {
  switch (status) {
    case 'ready':
      return 'success.main';
    case 'present':
      return 'warning.main';
    case 'queued':
      return 'info.main';
    case 'no-show':
      return 'error.main';
    case 'missing':
      return 'grey.400';
    default:
      return 'grey.400';
  }
}

function getStatusIcon(status: TeamReadinessStatus) {
  const iconProps = { sx: { fontSize: '1.5rem' } };

  switch (status) {
    case 'ready':
      return <CheckCircleIcon {...iconProps} color="success" />;
    case 'present':
      return <PersonPinIcon {...iconProps} color="warning" />;
    case 'queued':
      return <HourglassEmptyIcon {...iconProps} color="info" />;
    case 'no-show':
      return <BlockIcon {...iconProps} color="error" />;
    case 'missing':
      return <HelpOutlineIcon {...iconProps} color="disabled" />;
    default:
      return null;
  }
}

/**
 * Display panel for currently active match
 * Shows match info, participants, and progress
 */
export function ActiveMatchPanel({ match }: ActiveMatchPanelProps) {
  const t = useTranslations('pages.reports.field-status');
  const { getStage } = useMatchTranslations();

  if (!match) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            {t('active-match.title')}
          </Typography>
          <Typography color="text.secondary">{t('active-match.no-match')}</Typography>
        </Stack>
      </Paper>
    );
  }

  const getStatusColor = () => {
    if (match.status === 'in-progress') return 'success';
    if (match.status === 'completed') return 'primary';
    return 'default';
  };

  const getStatusText = () => {
    if (match.status === 'in-progress') return t('active-match.status.in-progress');
    if (match.status === 'completed') return t('active-match.status.completed');
    return match.status;
  };

  const formatDelay = (delta: number) => {
    const minutes = Math.floor(Math.abs(delta) / 60);
    const seconds = Math.abs(delta) % 60;
    const sign = delta > 0 ? '+' : '-';
    return `${sign}${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Typography variant="h5" fontWeight={700} sx={{ fontSize: '1.35rem' }}>
            {getStage(match.stage)} #{match.number}
          </Typography>
          <Chip
            label={getStatusText()}
            color={getStatusColor()}
            icon={match.status === 'in-progress' ? <PlayCircleFilledIcon /> : <CheckCircleIcon />}
          />
        </Stack>

        {match.startTime && (
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '1.05rem', fontWeight: 700 }}
            >
              {t('active-match.started-at')}: {dayjs(match.startTime).format('HH:mm:ss')}
            </Typography>
            {match.scheduledTime && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '1.05rem', fontWeight: 700 }}
              >
                {t('active-match.scheduled-at')}: {dayjs(match.scheduledTime).format('HH:mm:ss')}
              </Typography>
            )}
            {match.startDelta !== null && match.startDelta !== undefined && (
              <Typography
                variant="body2"
                color={Math.abs(match.startDelta) > 120 ? 'error' : 'text.secondary'}
                sx={{ fontSize: '1.05rem', fontWeight: 700 }}
              >
                {t('active-match.deviation')}: {formatDelay(match.startDelta)}
              </Typography>
            )}
          </Stack>
        )}

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            sx={{
              fontSize: '0.95rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}
          >
            {t('active-match.participants')}:
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 1
            }}
          >
            {[...match.participants]
              .filter(p => p.team)
              .sort((a, b) => {
                const numA = parseInt(a.table.name.match(/\d+/)?.[0] || '0', 10);
                const numB = parseInt(b.table.name.match(/\d+/)?.[0] || '0', 10);
                return numA - numB;
              })
              .map(participant => {
                const status = getParticipantStatus(participant);
                return (
                  <Stack
                    key={participant.id}
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                      border: '2px solid',
                      borderColor: getStatusBorderColor(status)
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ minWidth: 80, fontSize: '1.05rem' }}
                    >
                      {participant.table.name}:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ flex: 1, fontSize: '1.05rem', fontWeight: 700 }}
                    >
                      {t('active-match.team-label')} {participant.team?.number} -{' '}
                      {participant.team?.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 32,
                        width: 32,
                        height: 32
                      }}
                    >
                      {getStatusIcon(status)}
                    </Box>
                  </Stack>
                );
              })}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
