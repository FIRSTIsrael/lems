'use client';

import { Paper, Stack, Typography, Box, Chip } from '@mui/material';
import dayjs from 'dayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

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

interface Session {
  id: string;
  status: string;
  team: {
    id: string;
    number: number;
    name: string;
  };
  room: {
    id: string;
    name: string;
  };
}

interface NextMatchPanelProps {
  match: Match | null;
  activeSessions?: Session[];
}

/**
 * Display panel for next loaded match
 * Shows readiness status and conflicts
 */
export function NextMatchPanel({ match, activeSessions = [] }: NextMatchPanelProps) {
  if (!match) {
    return (
      <Paper sx={{ p: 3, flex: 1 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={600}>
            ⏰ המקצה הבא
          </Typography>
          <Typography color="text.secondary">אין מקצה טעון</Typography>
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
        return 'מוכן';
      case 'present':
        return 'נוכח';
      case 'queued':
        return 'בקיו';
      default:
        return 'לא נוכח';
    }
  };

  const checkTeamInJudging = (teamId: string) => {
    return activeSessions.find(s => s.team.id === teamId);
  };

  return (
    <Paper sx={{ p: 3, flex: 1 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <Typography variant="h5" fontWeight={600}>
            ⏰ המקצה הבא: {match.slug}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dayjs(match.scheduledTime).format('HH:mm')}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle1" fontWeight={500}>
            שולחנות מוכנים:
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
              const judgingSession = participant.team
                ? checkTeamInJudging(participant.team.id)
                : null;

              return (
                <Stack
                  key={participant.id}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    py: 1,
                    px: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    border: judgingSession ? '2px solid' : 'none',
                    borderColor: 'warning.main'
                  }}
                >
                  <Typography variant="body2" fontWeight={500} sx={{ minWidth: 80 }}>
                    {participant.table.name}:
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    קבוצה {participant.team?.number}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {getStatusIcon(status)}
                    <Typography variant="caption" color="text.secondary">
                      {getStatusText(status)}
                    </Typography>
                  </Stack>
                  {judgingSession && (
                    <Chip
                      icon={<WarningAmberIcon />}
                      label={`שיפוט: ${judgingSession.room.name}`}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
