'use client';

import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { JudgingSession, Room } from '../graphql';
import { TeamInfo } from '../../../components/team-info';
import { SessionStatusChip } from './session-status-chip';

interface SessionCardProps {
  session: JudgingSession;
  room: Room;
  isCurrentRound: boolean;
  sessionLength: number;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  room,
  isCurrentRound,
  sessionLength
}) => {
  const t = useTranslations('pages.judging-status');
  const team = session.team;

  return (
    <Card
      key={`${room.id}-${session.id}`}
      sx={{
        mb: 2,
        bgcolor: isCurrentRound ? 'primary.50' : 'background.paper'
      }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {t('table.room', { name: room.name })}
          </Typography>

          {team ? (
            <>
              <TeamInfo team={team} size="sm" />

              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                <SessionStatusChip status={session.status} arrived={team.arrived} />
              </Stack>

              {session.startTime && session.startDelta !== undefined && (
                <Typography variant="caption" color="text.secondary">
                  {t('table.started-at', {
                    time: dayjs(session.startTime).format('HH:mm')
                  })}
                  {session.startDelta !== 0 && (
                    <Typography
                      component="span"
                      variant="caption"
                      color={session.startDelta > 0 ? 'error' : 'success.main'}
                      sx={{ ml: 0.5 }}
                    >
                      ({session.startDelta > 0 ? '+' : ''}
                      {Math.round(session.startDelta / 1000)}s)
                    </Typography>
                  )}
                </Typography>
              )}

              {session.status === 'in-progress' && session.startTime && (
                <Typography variant="caption" color="text.secondary">
                  {t('table.ends-at', {
                    time: dayjs(session.startTime).add(sessionLength, 'seconds').format('HH:mm')
                  })}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.disabled">
              {t('empty-state.no-team')}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
