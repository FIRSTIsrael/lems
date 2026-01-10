'use client';

import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Paper, Stack, Typography, Box, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import { useMatchTranslations } from '@lems/localization';
import { useTime } from '../../../../../../../../lib/time/hooks';

interface Participant {
  id: string;
  team?: {
    id: string;
    number: number;
    name: string;
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
  participants: Participant[];
}

interface NextMatchPanelProps {
  match: Match | null;
}

/**
 * Display panel for next loaded match
 * Shows readiness status and conflicts
 */
export function NextMatchPanel({ match }: NextMatchPanelProps) {
  const t = useTranslations('pages.reports.field-status');
  const { getStage } = useMatchTranslations();
  const currentTime = useTime({ interval: 1000 });

  if (!match) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            ⏰ {t('next-match.title')}
          </Typography>
          <Typography color="text.secondary">{t('next-match.no-match')}</Typography>
        </Stack>
      </Paper>
    );
  }

  const participants = match.participants.filter(p => p.team);
  const tablesReady = participants.filter(p => p.ready).length;
  const totalTables = participants.length;

  const getParticipantStatus = (participant: Participant) => {
    if (participant.ready) return 'ready';
    if (participant.present) return 'present';
    if (participant.queued) return 'queued';
    return 'not-present';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircleIcon fontSize="small" color="success" />;
      case 'present':
        return <AccessTimeIcon fontSize="small" color="warning" />;
      case 'queued':
        return <AccessTimeIcon fontSize="small" color="info" />;
      default:
        return <CancelIcon fontSize="small" color="error" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return t('next-match.status.ready');
      case 'present':
        return t('next-match.status.present');
      case 'queued':
        return t('next-match.status.queued');
      default:
        return t('next-match.status.not-present');
    }
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <Typography variant="h5" fontWeight={700} sx={{ fontSize: '1.35rem' }}>
            ⏰ {getStage(match.stage)} #{match.number}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '1.05rem', fontWeight: 700 }}
          >
            {currentTime
              .set('hour', dayjs(match.scheduledTime).hour())
              .set('minute', dayjs(match.scheduledTime).minute())
              .format('HH:mm')}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1.05rem' }}>
            {t('next-match.tables-ready')}:
          </Typography>
          <Chip
            label={`${tablesReady}/${totalTables}`}
            color={
              tablesReady === totalTables ? 'success' : tablesReady > 0 ? 'warning' : 'default'
            }
            size="small"
          />
        </Stack>

        <Box>
          <Stack spacing={1}>
            {participants.map(participant => {
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
                    bgcolor: 'background.default',
                    borderRadius: 1
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ maxWidth: 80, fontSize: '1.05rem' }}
                  >
                    {participant.table.name}:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ flex: 1, fontSize: '1.05rem', fontWeight: 500 }}
                  >
                    {participant.team
                      ? t('next-match.team-number', { number: participant.team.number })
                      : '—'}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {getStatusIcon(status)}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.95rem', fontWeight: 500 }}
                    >
                      {getStatusText(status)}
                    </Typography>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
