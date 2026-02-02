'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Checkbox,
  Tooltip,
  Stack,
  Chip,
  Box,
  Typography,
  Skeleton
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useTime } from '../../../../../../../lib/time/hooks/use-time';
import {
  UPDATE_MATCH_MUTATION,
  UPDATE_MATCH_PARTICIPANT_MUTATION,
  type RobotGameMatch,
  type RobotGameTable
} from '../graphql';
import { GET_HEAD_QUEUER_DATA } from '../graphql/query';

interface FieldScheduleProps {
  divisionId: string;
  matches: RobotGameMatch[];
  tables: RobotGameTable[];
  loadedMatchId?: string | null;
  loading?: boolean;
}

export function FieldSchedule({
  divisionId,
  matches,
  tables,
  loadedMatchId,
  loading
}: FieldScheduleProps) {
  const t = useTranslations('pages.field-head-queuer.field-schedule');
  const currentTime = useTime({ interval: 1000 });

  const [updateMatchMutation] = useMutation(UPDATE_MATCH_MUTATION, {
    onError: () => toast.error(t('error.update-match-failed')),
    refetchQueries: [{ query: GET_HEAD_QUEUER_DATA, variables: { divisionId } }],
    awaitRefetchQueries: true
  });

  const [updateParticipantMutation] = useMutation(UPDATE_MATCH_PARTICIPANT_MUTATION, {
    onError: () => toast.error(t('error.update-participant-failed')),
    refetchQueries: [{ query: GET_HEAD_QUEUER_DATA, variables: { divisionId } }],
    awaitRefetchQueries: true
  });

  const handleCallMatch = useCallback(
    async (matchId: string, called: boolean) => {
      await updateMatchMutation({
        variables: { divisionId, matchId, called }
      });
    },
    [divisionId, updateMatchMutation]
  );

  const handleToggleParticipant = useCallback(
    async (matchId: string, teamId: string, queued: boolean) => {
      await updateParticipantMutation({
        variables: { divisionId, matchId, teamId, queued }
      });
    },
    [divisionId, updateParticipantMutation]
  );

  const availableMatches = useMemo(() => {
    return matches
      .filter(
        match =>
          match.status === 'not-started' &&
          match.stage !== 'test' &&
          match.id !== loadedMatchId &&
          currentTime.diff(dayjs(match.scheduledTime), 'minute') >= -20
      )
      .slice(1, 4);
  }, [matches, loadedMatchId, currentTime]);

  const isTeamBusy = useCallback(() => false, []);

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Paper>
    );
  }

  if (availableMatches.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('no-matches')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('no-matches-description')}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">{t('title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              align="center"
              sx={{
                fontWeight: 600,
                position: 'sticky',
                left: 0,
                top: 0,
                bgcolor: 'background.paper',
                zIndex: 20
              }}
            >
              {t('match-number')}
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                position: 'sticky',
                top: 0,
                bgcolor: 'background.paper',
                zIndex: 10
              }}
            >
              {t('time')}
            </TableCell>
            {tables.map(table => (
              <TableCell
                key={table.id}
                align="center"
                sx={{
                  fontWeight: 600,
                  position: 'sticky',
                  top: 0,
                  bgcolor: 'background.paper',
                  zIndex: 10
                }}
              >
                {table.name}
              </TableCell>
            ))}
            <TableCell
              sx={{
                fontWeight: 600,
                position: 'sticky',
                top: 0,
                bgcolor: 'background.paper',
                zIndex: 10
              }}
            >
              {t('actions')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {availableMatches.map(match => (
            <TableRow
              key={match.id}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                bgcolor: match.called ? 'action.hover' : 'inherit'
              }}
            >
              <TableCell
                component="th"
                scope="row"
                align="center"
                sx={{
                  position: 'sticky',
                  left: 0,
                  bgcolor: match.called ? 'action.hover' : 'background.paper',
                  zIndex: 5
                }}
              >
                <Chip label={match.number} size="small" color="primary" />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {dayjs(match.scheduledTime).format('HH:mm')}
                </Typography>
              </TableCell>
              {tables.map(table => {
                const participant = match.participants.find(p => p.table?.id === table.id);
                const team = participant?.team ?? null;
                const teamInJudging = isTeamBusy();
                const isSignedIn = team?.arrived ?? false;
                const statusKey = !team
                  ? 'unknown_team'
                  : !isSignedIn
                    ? 'not_signed_in'
                    : participant?.queued
                      ? 'at_match'
                      : 'not_at_match';

                return (
                  <TableCell key={table.id} align="center">
                    <Stack spacing={1} alignItems="center" justifyContent="center">
                      {team ? (
                        <Tooltip title={`${team.number} - ${team.name}`} arrow>
                          <Chip
                            label={team.number}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}

                      {match.called && team && participant && (
                        <>
                          {teamInJudging ? (
                            <Tooltip title={t('team-in-judging')} arrow>
                              <WarningAmberRoundedIcon color="warning" fontSize="small" />
                            </Tooltip>
                          ) : (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={t(`status.${statusKey}`)}
                                size="small"
                                color={
                                  statusKey === 'at_match'
                                    ? 'success'
                                    : statusKey === 'not_signed_in'
                                      ? 'error'
                                      : statusKey === 'not_at_match'
                                        ? 'warning'
                                        : 'default'
                                }
                                variant={statusKey === 'unknown_team' ? 'outlined' : 'filled'}
                              />
                              <Checkbox
                                checked={participant.queued}
                                disabled={!isSignedIn}
                                size="small"
                                onChange={() =>
                                  handleToggleParticipant(match.id, team.id, !participant.queued)
                                }
                              />
                            </Stack>
                          )}
                        </>
                      )}
                    </Stack>
                  </TableCell>
                );
              })}
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  color={match.called ? 'error' : 'primary'}
                  onClick={() => handleCallMatch(match.id, !match.called)}
                  sx={{ minWidth: 80 }}
                >
                  {match.called ? t('cancel') : t('call')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
