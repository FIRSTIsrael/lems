'use client';

import { useTranslations } from 'next-intl';
import { Paper, Stack, Typography, Chip, Box } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';

interface Session {
  id: string;
  number: number;
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

interface Participant {
  team?: {
    id: string;
    number: number;
  } | null;
}

interface Match {
  id: string;
  slug: string;
  number: number;
  participants: Participant[];
}

interface JudgingIntegrationProps {
  activeSessions: Session[];
  queuedMatches: Match[];
}

/**
 * Shows judging-field conflicts
 * Highlights teams that are in judging and called to field
 */
export function JudgingIntegration({ activeSessions, queuedMatches }: JudgingIntegrationProps) {
  const t = useTranslations('pages.reports.field-status');

  if (activeSessions.length === 0) {
    return null;
  }

  // Find conflicts: teams in judging that are also in queued matches
  const conflicts: Array<{ session: Session; match: Match }> = [];

  activeSessions.forEach(session => {
    queuedMatches.forEach(match => {
      const hasTeam = match.participants.some(p => p.team?.id === session.team.id);
      if (hasTeam) {
        conflicts.push({ session, match });
      }
    });
  });

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={600}>
          🎯 {t('judging-integration.title')}
        </Typography>

        {/* Active Sessions */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <InfoIcon fontSize="small" color="info" />
            <Typography variant="subtitle2">{t('judging-integration.active-sessions')}</Typography>
            <Chip label={activeSessions.length} size="small" color="info" />
          </Stack>

          <Stack spacing={1}>
            {activeSessions.map(session => (
              <Box
                key={session.id}
                sx={{
                  p: 1.5,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                <Typography variant="body2">
                  {t('judging-integration.team-info', {
                    number: session.team.number,
                    name: session.team.name
                  })}
                </Typography>
                <Chip label={session.room.name} size="small" variant="outlined" color="info" />
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Conflicts */}
        {conflicts.length > 0 && (
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <WarningAmberIcon fontSize="small" color="warning" />
              <Typography variant="subtitle2" color="warning.main">
                {t('judging-integration.conflicts')}
              </Typography>
              <Chip label={conflicts.length} size="small" color="warning" />
            </Stack>

            <Stack spacing={1}>
              {conflicts.map((conflict, index) => (
                <Box
                  key={`${conflict.session.id}-${conflict.match.id}`}
                  sx={{
                    p: 1.5,
                    bgcolor: 'warning.lighter',
                    borderRadius: 1,
                    border: '2px solid',
                    borderColor: 'warning.main'
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                      {t('judging-integration.team-number', {
                        number: conflict.session.team.number
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('judging-integration.conflict-details', {
                        room: conflict.session.room.name,
                        match: conflict.match.slug
                      })}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {conflicts.length === 0 && (
          <Box
            sx={{
              p: 2,
              bgcolor: 'success.lighter',
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" color="success.dark">
              ✓ {t('judging-integration.no-conflicts')}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
