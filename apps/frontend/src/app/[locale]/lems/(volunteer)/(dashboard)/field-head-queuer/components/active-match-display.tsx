'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Paper, Stack, Typography, Chip, Box, Skeleton, Checkbox, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { UPDATE_MATCH_PARTICIPANT_MUTATION, type RobotGameMatch } from '../graphql';
import { GET_HEAD_QUEUER_DATA } from '../graphql/query';

interface ActiveMatchDisplayProps {
  divisionId: string;
  activeMatch: RobotGameMatch | null;
  loadedMatch: RobotGameMatch | null;
  loading?: boolean;
}

export function ActiveMatchDisplay({
  divisionId,
  activeMatch,
  loadedMatch,
  loading
}: ActiveMatchDisplayProps) {
  const t = useTranslations('pages.field-head-queuer.active-match');

  const [updateParticipantMutation] = useMutation(UPDATE_MATCH_PARTICIPANT_MUTATION, {
    onError: () => toast.error(t('error.update-participant-failed')),
    refetchQueries: [{ query: GET_HEAD_QUEUER_DATA, variables: { divisionId } }],
    awaitRefetchQueries: true
  });

  const handleToggleArrivedToMatch = useCallback(
    async (matchId: string, teamId: string, queued: boolean) => {
      await updateParticipantMutation({
        variables: { divisionId, matchId, teamId, queued }
      });
    },
    [divisionId, updateParticipantMutation]
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
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PlayArrowIcon />
            <Typography variant="h6" fontWeight={600}>
              {t('running-match')}
            </Typography>
          </Stack>
          {activeMatch ? (
            <>
              <Box>
                <Chip
                  label={`${t('match')} ${activeMatch.number}`}
                  size="medium"
                  sx={{
                    bgcolor: 'success.dark',
                    color: 'success.contrastText',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}
                />
              </Box>
              {activeMatch.startTime && (
                <Typography variant="body2">
                  {t('started-at', {
                    time: dayjs(activeMatch.startTime).format('HH:mm:ss')
                  })}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2">{t('no-active-match')}</Typography>
          )}
        </Stack>
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
              <Box>
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
              </Box>
              <Typography variant="body2">
                {t('scheduled-at', {
                  time: dayjs(loadedMatch.scheduledTime).format('HH:mm')
                })}
              </Typography>

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
                      const teamId = participant.team?.id ?? null;

                      const statusKey = !participant.team
                        ? 'empty_table'
                        : !isSignedIn
                          ? 'not_signed_in'
                          : isMarkedPresent
                            ? 'at_match'
                            : 'not_at_match';

                      const statusChip =
                        statusKey === 'at_match'
                          ? { color: 'success' as const, variant: 'filled' as const }
                          : statusKey === 'not_signed_in'
                            ? { color: 'error' as const, variant: 'filled' as const }
                            : statusKey === 'not_at_match'
                              ? { color: 'warning' as const, variant: 'filled' as const }
                              : { color: 'default' as const, variant: 'outlined' as const };

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

                          {teamId && (
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
                                      teamId,
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
