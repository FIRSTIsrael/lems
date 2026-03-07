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
import { useTime } from '../../../../../../../lib/time/hooks/use-time';
import { UPDATE_MATCH_MUTATION, UPDATE_PARTICIPANT_STATUS_MUTATION } from '../graphql';
import { GET_HEAD_QUEUER_DATA } from '../graphql/query';
import { useFieldHeadQueuer } from './field-head-queuer-context';

function getStatusKey(
  hasTeam: boolean,
  isSignedIn: boolean,
  isQueued: boolean
): 'unknown_team' | 'not_signed_in' | 'at_match' | 'not_at_match' {
  if (!hasTeam) return 'unknown_team';
  if (!isSignedIn) return 'not_signed_in';
  if (isQueued) return 'at_match';
  return 'not_at_match';
}

function getStatusChipColor(
  statusKey: 'unknown_team' | 'not_signed_in' | 'at_match' | 'not_at_match'
): 'success' | 'error' | 'warning' | 'default' {
  if (statusKey === 'at_match') return 'success';
  if (statusKey === 'not_signed_in') return 'error';
  if (statusKey === 'not_at_match') return 'warning';
  return 'default';
}

function getStatusChipVariant(
  statusKey: 'unknown_team' | 'not_signed_in' | 'at_match' | 'not_at_match'
): 'outlined' | 'filled' {
  return statusKey === 'unknown_team' ? 'outlined' : 'filled';
}

export function FieldSchedule() {
  const t = useTranslations('pages.field-head-queuer.field-schedule');
  const { divisionId, matches, tables, loadedMatch, loading } = useFieldHeadQueuer();
  const loadedMatchId = loadedMatch?.id;
  const currentTime = useTime({ interval: 1000 });

  const [updateMatchMutation] = useMutation(UPDATE_MATCH_MUTATION, {
    onError: () => toast.error(t('error.update-match-failed')),
    refetchQueries: [{ query: GET_HEAD_QUEUER_DATA, variables: { divisionId } }],
    awaitRefetchQueries: true
  });

  const [updateParticipantMutation] = useMutation(UPDATE_PARTICIPANT_STATUS_MUTATION, {
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
    async (matchId: string, participantId: string, queued: boolean) => {
      await updateParticipantMutation({
        variables: { divisionId, matchId, participantId, queued }
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
                const isSignedIn = team?.arrived ?? false;
                const statusKey = getStatusKey(!!team, isSignedIn, participant?.queued ?? false);

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
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={t(`status.${statusKey}`)}
                            size="small"
                            color={getStatusChipColor(statusKey)}
                            variant={getStatusChipVariant(statusKey)}
                          />
                          <Checkbox
                            checked={participant.queued}
                            disabled={!isSignedIn}
                            size="small"
                            onChange={() =>
                              handleToggleParticipant(match.id, participant.id, !participant.queued)
                            }
                          />
                        </Stack>
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
