'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Paper, Stack, Typography, Chip, Skeleton, Checkbox, Tooltip, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { UPDATE_MATCH_PARTICIPANT_MUTATION, UPDATE_MATCH_MUTATION } from '../graphql';
import { GET_HEAD_QUEUER_DATA } from '../graphql/query';
import { useFieldHeadQueuer } from './field-head-queuer-context';

function getStatusKey(
  hasTeam: boolean,
  isSignedIn: boolean,
  isMarkedPresent: boolean
): 'empty_table' | 'not_signed_in' | 'at_match' | 'not_at_match' {
  if (!hasTeam) return 'empty_table';
  if (!isSignedIn) return 'not_signed_in';
  if (isMarkedPresent) return 'at_match';
  return 'not_at_match';
}

function getStatusChipProps(
  statusKey: 'empty_table' | 'not_signed_in' | 'at_match' | 'not_at_match'
): { color: 'success' | 'error' | 'warning' | 'default'; variant: 'filled' | 'outlined' } {
  if (statusKey === 'at_match') return { color: 'success', variant: 'filled' };
  if (statusKey === 'not_signed_in') return { color: 'error', variant: 'filled' };
  if (statusKey === 'not_at_match') return { color: 'warning', variant: 'filled' };
  return { color: 'default', variant: 'outlined' };
}

export function ActiveMatchDisplay() {
  const t = useTranslations('pages.field-head-queuer.active-match');
  const { divisionId, activeMatch, loadedMatch, loading } = useFieldHeadQueuer();

  const [updateParticipantMutation] = useMutation(UPDATE_MATCH_PARTICIPANT_MUTATION, {
    onError: () => toast.error(t('error.update-participant-failed')),
    refetchQueries: [{ query: GET_HEAD_QUEUER_DATA, variables: { divisionId } }],
    awaitRefetchQueries: true
  });

  const [updateMatchMutation] = useMutation(UPDATE_MATCH_MUTATION, {
    onError: () => toast.error(t('error.update-match-failed')),
    refetchQueries: [{ query: GET_HEAD_QUEUER_DATA, variables: { divisionId } }],
    awaitRefetchQueries: true
  });

  const handleToggleArrivedToMatch = useCallback(
    async (matchId: string, participantId: string, queued: boolean) => {
      await updateParticipantMutation({
        variables: { divisionId, matchId, participantId, queued }
      });
    },
    [divisionId, updateParticipantMutation]
  );

  const handleCallMatch = useCallback(
    async (matchId: string, called: boolean) => {
      await updateMatchMutation({
        variables: { divisionId, matchId, called }
      });
    },
    [divisionId, updateMatchMutation]
  );

  if (loading) {
    return (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Skeleton variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 1 }} />
      </Stack>
    );
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Paper
        sx={{
          flex: 1,
          p: 3,
          bgcolor: activeMatch ? 'success.main' : 'action.disabledBackground',
          color: activeMatch ? 'success.contrastText' : 'text.secondary'
        }}
      >
        {activeMatch ? (
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <PlayArrowIcon />
            <Typography variant="h6" fontWeight={600}>
              {t('running-match')}
            </Typography>
            <Chip
              label={`${t('match')} ${activeMatch.number}`}
              size="small"
              sx={{
                bgcolor: 'success.dark',
                color: 'success.contrastText',
                fontWeight: 600
              }}
            />
            {activeMatch.startTime && (
              <Typography variant="body2">
                {t('started-at', {
                  time: dayjs(activeMatch.startTime).format('HH:mm:ss')
                })}
              </Typography>
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PlayArrowIcon />
              <Typography variant="h6" fontWeight={600}>
                {t('running-match')}
              </Typography>
            </Stack>
            <Typography variant="body2">{t('no-active-match')}</Typography>
          </Stack>
        )}
      </Paper>

      <Paper
        sx={{
          flex: 1,
          p: 3,
          bgcolor: loadedMatch ? 'primary.main' : 'action.disabledBackground',
          color: loadedMatch ? 'primary.contrastText' : 'text.secondary'
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ScheduleIcon />
            <Typography variant="h6" fontWeight={600}>
              {t('next-match')}
            </Typography>
          </Stack>
          {loadedMatch ? (
            <>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                flexWrap="wrap"
                sx={{ justifyContent: 'space-between' }}
              >
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Chip
                    label={`${t('match')} ${loadedMatch.number}`}
                    size="medium"
                    sx={{
                      bgcolor: 'primary.dark',
                      color: 'primary.contrastText',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  />
                  <Typography variant="body2">
                    {t('scheduled-at', {
                      time: dayjs(loadedMatch.scheduledTime).format('HH:mm')
                    })}
                  </Typography>
                </Stack>

                <Button
                  variant="contained"
                  size="medium"
                  color={loadedMatch.called ? 'error' : 'success'}
                  onClick={() => handleCallMatch(loadedMatch.id, !loadedMatch.called)}
                  sx={{ minWidth: 120 }}
                >
                  {loadedMatch.called ? t('cancel-call') : t('call-teams')}
                </Button>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {t('teams')}
                </Typography>
                <Stack spacing={1}>
                  {loadedMatch.participants
                    .slice()
                    .sort((a, b) => (a.table?.name || '').localeCompare(b.table?.name || ''))
                    .map(participant => {
                      const isMarkedPresent = participant.queued;
                      const isSignedIn = participant.team?.arrived ?? false;
                      const teamNumber = participant.team?.number ?? '—';
                      const tableName = participant.table?.name ?? '—';
                      const participantId = participant.id;

                      const statusKey = getStatusKey(
                        !!participant.team,
                        isSignedIn,
                        isMarkedPresent
                      );

                      const statusChip = getStatusChipProps(statusKey);

                      return (
                        <Stack
                          key={participant.id}
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: 'rgba(255,255,255,0.08)'
                          }}
                        >
                          <Chip
                            label={tableName}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.14)',
                              color: 'primary.contrastText'
                            }}
                          />
                          <Chip
                            label={teamNumber}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: 'rgba(255,255,255,0.6)',
                              color: 'primary.contrastText',
                              fontWeight: 600
                            }}
                          />
                          <Chip
                            label={t(`status.${statusKey}`)}
                            size="small"
                            color={statusChip.color}
                            variant={statusChip.variant}
                            sx={
                              statusChip.variant === 'outlined'
                                ? {
                                    borderColor: 'rgba(255,255,255,0.6)',
                                    color: 'primary.contrastText'
                                  }
                                : undefined
                            }
                          />

                          {participant.team && (
                            <Tooltip
                              title={
                                !isSignedIn
                                  ? t('mark-disabled-not-signed-in')
                                  : isMarkedPresent
                                    ? t('unmark-arrived-to-match')
                                    : t('mark-arrived-to-match')
                              }
                              arrow
                            >
                              <span>
                                <Checkbox
                                  checked={isMarkedPresent}
                                  disabled={!isSignedIn}
                                  onChange={() => {
                                    if (!loadedMatch) return;
                                    handleToggleArrivedToMatch(
                                      loadedMatch.id,
                                      participantId,
                                      !isMarkedPresent
                                    );
                                  }}
                                  sx={{
                                    color: 'rgba(255,255,255,0.75)',
                                    '&.Mui-checked': { color: 'success.light' }
                                  }}
                                />
                              </span>
                            </Tooltip>
                          )}
                        </Stack>
                      );
                    })}
                </Stack>
              </Stack>
            </>
          ) : (
            <Typography variant="body2">{t('no-loaded-match')}</Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
