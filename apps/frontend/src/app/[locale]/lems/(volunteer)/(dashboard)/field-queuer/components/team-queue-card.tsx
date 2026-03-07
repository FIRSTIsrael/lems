'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Paper, Stack, Typography, Chip, Tooltip } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { red, orange } from '@mui/material/colors';
import { useTime } from '../../../../../../../lib/time/hooks/use-time';

interface TeamQueueCardProps {
  teamNumber: number;
  teamName: string;
  tableName: string;
  matchNumber: number;
  scheduledTime: string;
  isInJudging: boolean;
  isUrgent: boolean;
}

export function TeamQueueCard({
  teamNumber,
  teamName,
  tableName,
  matchNumber,
  scheduledTime,
  isInJudging,
  isUrgent
}: TeamQueueCardProps) {
  const t = useTranslations('pages.field-queuer.team-card');
  const tCommon = useTranslations('pages.field-head-queuer.active-match');
  const currentTime = useTime({ interval: 1000 });

  const timeInfo = useMemo(() => {
    const scheduled = dayjs(scheduledTime);
    const diffMinutes = currentTime.diff(scheduled, 'minute');
    const isPast = diffMinutes > 0;
    const absMinutes = Math.abs(diffMinutes);

    return {
      formattedTime: scheduled.format('HH:mm'),
      diffMinutes: absMinutes,
      isPast
    };
  }, [scheduledTime, currentTime]);

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        ...(isUrgent && {
          bgcolor: red[50],
          border: `2px solid ${red[400]}`
        }),
        ...(isInJudging &&
          !isUrgent && {
            bgcolor: orange[50],
            border: `2px solid ${orange[400]}`
          })
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Stack spacing={0.5} flex={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              #{teamNumber}
            </Typography>
            {isInJudging && (
              <Tooltip title={t('in-judging-tooltip')} arrow>
                <WarningAmberRoundedIcon color="warning" fontSize="small" />
              </Tooltip>
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {teamName}
          </Typography>
        </Stack>

        <Stack spacing={0.5} alignItems="flex-end">
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            <Chip
              label={`${tCommon('match')} ${matchNumber}`}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={tableName}
              size="medium"
              color="primary"
              sx={{ fontWeight: 600, fontSize: '0.95rem' }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {timeInfo.formattedTime} (
            {timeInfo.isPast
              ? t('time-ago', { minutes: timeInfo.diffMinutes })
              : t('time-until', { minutes: timeInfo.diffMinutes })}
            )
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
