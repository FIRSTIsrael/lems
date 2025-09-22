'use client';

import React from 'react';
import { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
  Divider,
  Grid
} from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Group,
  LocationOn,
  TableRestaurant,
  Sports,
  SportsScore,
  Event,
  WatchLater
} from '@mui/icons-material';
import { useSchedule } from './schedule-context';
import { getDuration } from './calendar/calendar-utils';

export const ScheduleSettings: React.FC = () => {
  const t = useTranslations('pages.events.schedule.settings');
  const {
    teamsCount,
    roomsCount,
    tablesCount,
    staggerMatches,
    practiceCycleTime,
    rankingCycleTime,
    judgingSessionCycleTime,
    matchLength,
    judgingSessionLength,
    setStaggerMatches,
    setPracticeCycleTime,
    setRankingCycleTime,
    setJudgingSessionCycleTime,
    setMatchLength,
    setJudgingSessionLength,
    practiceRounds,
    rankingRounds,
    judgingStart,
    fieldStart,
    matchesPerRound,
    allowStagger
  } = useSchedule();

  const totalMatches = React.useMemo(() => {
    return matchesPerRound * (practiceRounds + rankingRounds);
  }, [matchesPerRound, practiceRounds, rankingRounds]);

  const totalSessions = React.useMemo(() => {
    return Math.ceil(teamsCount / roomsCount);
  }, [teamsCount, roomsCount]);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
        maxHeight: '100%',
        overflowY: 'auto'
      }}
    >
      <Stack spacing={3}>
        <Typography variant="h6" component="h2" fontWeight={600}>
          {t('title')}
        </Typography>

        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            {t('information.title')}
          </Typography>
          <Stack direction="row" spacing={4} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Group color="primary" />
              <Typography variant="body2">
                {t('information.teams')}: {teamsCount}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOn color="primary" />
              <Typography variant="body2">
                {t('information.rooms')}: {roomsCount}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <TableRestaurant color="primary" />
              <Typography variant="body2">
                {t('information.tables')}: {tablesCount}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Box>
          <Stack direction="row" spacing={4} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Sports color="primary" />
              <Typography variant="body2">
                {t('information.total-matches')}: {totalMatches}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Event color="primary" />
              <Typography variant="body2">
                {t('information.total-sessions')}: {totalSessions}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Box>
          <Stack direction="row" spacing={4} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <SportsScore color="primary" />
              <Typography variant="body2">
                {t('information.practice-rounds')}: {practiceRounds}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <SportsScore color="primary" />
              <Typography variant="body2">
                {t('information.ranking-rounds')}: {rankingRounds}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <SportsScore color="primary" />
              <Typography variant="body2">
                {t('information.matches-per-round')}: {matchesPerRound}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Box>
          <Stack direction="row" spacing={4} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <WatchLater color="primary" />
              <Typography variant="body2">
                {t('information.judging-start')}: {judgingStart.format('HH:mm')}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <WatchLater color="primary" />
              <Typography variant="body2">
                {t('information.field-start')}: {fieldStart.format('HH:mm')}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            {t('settings.title')}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                disabled={!allowStagger}
                checked={staggerMatches}
                onChange={e => setStaggerMatches(e.target.checked)}
                color="primary"
              />
            }
            label={t('settings.stagger-matches')}
          />
        </Box>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container size={12} spacing={3}>
            <Grid size={6}>
              <TimePicker
                label={t('timing.practice-cycle-time')}
                value={practiceCycleTime}
                onChange={(value: Dayjs | null) => {
                  if (!value) return;
                  setPracticeCycleTime(value);
                }}
                ampm={false}
                format="mm:ss"
                views={['minutes', 'seconds']}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
                minTime={matchLength}
              />
            </Grid>
            <Grid size={6}>
              <TimePicker
                label={t('timing.ranking-cycle-time')}
                value={rankingCycleTime}
                onChange={(value: Dayjs | null) => {
                  if (!value) return;
                  setRankingCycleTime(value);
                }}
                ampm={false}
                format="mm:ss"
                views={['minutes', 'seconds']}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
                minTime={matchLength}
              />
            </Grid>
            <Grid size={6}>
              <TimePicker
                label={t('timing.judging-session-cycle-time')}
                value={judgingSessionCycleTime}
                onChange={(value: Dayjs | null) => {
                  if (!value) return;
                  setJudgingSessionCycleTime(value);
                }}
                ampm={false}
                format="HH:mm:ss"
                views={['hours', 'minutes', 'seconds']}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
                minTime={judgingSessionLength}
              />
            </Grid>
            <Grid size={12} />
            <Grid size={6}>
              <TimePicker
                label={t('timing.match-length')}
                value={matchLength}
                onChange={(value: Dayjs | null) => {
                  if (!value) return;
                  setMatchLength(value);
                }}
                ampm={false}
                format="mm:ss"
                views={['minutes', 'seconds']}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
                maxTime={
                  getDuration(practiceCycleTime) < getDuration(rankingCycleTime)
                    ? practiceCycleTime
                    : rankingCycleTime
                }
              />
            </Grid>
            <Grid size={6}>
              <TimePicker
                label={t('timing.judging-session-length')}
                value={judgingSessionLength}
                onChange={(value: Dayjs | null) => {
                  if (!value) return;
                  setJudgingSessionLength(value);
                }}
                ampm={false}
                format="mm:ss"
                views={['minutes', 'seconds']}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
                maxTime={judgingSessionCycleTime}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Stack>
    </Paper>
  );
};

export default ScheduleSettings;
