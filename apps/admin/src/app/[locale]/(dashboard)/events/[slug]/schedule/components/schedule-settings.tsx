'use client';

import React from 'react';
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
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import SportsIcon from '@mui/icons-material/Sports';
import EventIcon from '@mui/icons-material/Event';
import { useSchedule } from './schedule-context';

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
    setJudgingSessionLength
  } = useSchedule();

  // Calculate derived values that will be shown in calendar
  const totalMatches = React.useMemo(() => {
    // This would be calculated based on practice + ranking rounds from calendar state
    // For now, showing a basic calculation
    return teamsCount * 4; // Assuming 1 practice + 3 ranking rounds
  }, [teamsCount]);

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
        backgroundColor: 'background.paper'
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
              <GroupIcon color="primary" />
              <Typography variant="body2">
                {t('information.teams')}: {teamsCount}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOnIcon color="primary" />
              <Typography variant="body2">
                {t('information.rooms')}: {roomsCount}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <TableRestaurantIcon color="primary" />
              <Typography variant="body2">
                {t('information.tables')}: {tablesCount}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            {t('information.calculated')}
          </Typography>
          <Stack direction="row" spacing={4} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <SportsIcon color="primary" />
              <Typography variant="body2">Total Matches: {totalMatches}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <EventIcon color="primary" />
              <Typography variant="body2">Total Sessions: {totalSessions}</Typography>
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
                onChange={setPracticeCycleTime}
                ampm={false}
                format="mm:ss"
                views={['minutes', 'seconds']}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid size={6}>
              <TimePicker
                label={t('timing.ranking-cycle-time')}
                value={rankingCycleTime}
                onChange={setRankingCycleTime}
                ampm={false}
                format="mm:ss"
                views={['minutes', 'seconds']}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid size={6}>
              <TimePicker
                label={t('timing.judging-session-cycle-time')}
                value={judgingSessionCycleTime}
                onChange={setJudgingSessionCycleTime}
                ampm={false}
                format="mm:ss"
                views={['minutes', 'seconds']}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid size={12} />
            <Grid size={6}>
              <TimePicker
                label={t('timing.match-length')}
                value={matchLength}
                onChange={setMatchLength}
                ampm={false}
                format="mm:ss"
                views={['minutes', 'seconds']}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid size={6}>
              <TimePicker
                label={t('timing.judging-session-length')}
                value={judgingSessionLength}
                onChange={setJudgingSessionLength}
                ampm={false}
                format="mm:ss"
                views={['minutes', 'seconds']}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Stack>
    </Paper>
  );
};

export default ScheduleSettings;
