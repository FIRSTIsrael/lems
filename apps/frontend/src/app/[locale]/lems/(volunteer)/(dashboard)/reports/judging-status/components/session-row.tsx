'use client';

import { Box, Stack, TableCell, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { JudgingSession } from '../graphql';
import { TeamInfo } from '../../../components/team-info';
import { SessionStatusChip } from './session-status-chip';

interface SessionRowProps {
  session: JudgingSession;
  sessionLength: number;
}

export const SessionRow: React.FC<SessionRowProps> = ({ session, sessionLength }) => {
  const t = useTranslations('pages.judging-status');
  const team = session.team;

  return (
    <TableCell align="center" sx={{ verticalAlign: 'top', py: 2 }}>
      {session && team ? (
        <Stack spacing={1} alignItems="center">
          <Box sx={{ minWidth: 180 }}>
            <TeamInfo team={team} size="sm" textAlign="center" />
          </Box>

          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
            <SessionStatusChip
              status={session.status}
              called={session.called}
              arrived={team.arrived}
              isQueued={session.queued}
            />
          </Stack>

          {session.startTime && session.startDelta !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {t('table.started-at', {
                time: dayjs(session.startTime).format('HH:mm')
              })}
            </Typography>
          )}

          {session.status === 'in-progress' && session.startTime && (
            <Typography variant="caption" color="text.secondary">
              {t('table.ends-at', {
                time: dayjs(session.startTime).add(sessionLength, 'seconds').format('HH:mm')
              })}
            </Typography>
          )}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.disabled">
          —
        </Typography>
      )}
    </TableCell>
  );
};
