'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import {
  Paper,
  Typography,
  Stack,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';

interface ScheduleEntry {
  time: Date;
  type: string;
  location: string;
  isMatch: boolean;
}

interface Match {
  scheduledTime: string | Date;
  stage: string;
  number: number;
  tableName: string;
}

interface JudgingSession {
  scheduledTime: string | Date;
  number: number;
  roomName: string;
}

interface TeamScheduleProps {
  teamMatches: Match[];
  teamJudging: JudgingSession[];
  teamNumber: number;
}

export const TeamSchedule: React.FC<TeamScheduleProps> = ({
  teamMatches,
  teamJudging,
  teamNumber
}) => {
  const t = useTranslations('pages.team-in-event');

  const scheduleEntries: ScheduleEntry[] = [
    ...teamMatches.map(match => ({
      time: new Date(match.scheduledTime),
      type: t('schedule.match-type', {
        stage: match.stage,
        number: match.number,
        table: match.tableName,
        teamNumber: teamNumber
      }),
      location: match.tableName,
      isMatch: true
    })),
    ...teamJudging.map(session => ({
      time: new Date(session.scheduledTime),
      type: t('schedule.judging-session', {
        number: session.number,
        room: session.roomName,
        teamNumber: teamNumber
      }),
      location: session.roomName,
      isMatch: false
    }))
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  return (
    <Paper
      sx={{
        p: 3,
        flexGrow: { xs: 0, lg: 1 },
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <ScheduleIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          {t('schedule.title')}
        </Typography>
      </Stack>

      {scheduleEntries.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('schedule.no-schedule')}
          </Typography>
        </Box>
      )}

      {scheduleEntries.length > 0 && (
        <List disablePadding>
          {scheduleEntries.map((entry, index) => (
            <React.Fragment key={index}>
              <ListItem
                sx={{
                  py: 2,
                  px: 0,
                  '&:hover': {
                    bgcolor: 'grey.50'
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="body2" fontWeight="600">
                        {dayjs(entry.time).format('HH:mm')}
                      </Typography>
                      <Box
                        sx={{
                          width: '1px',
                          height: '20px',
                          bgcolor: 'grey.400',
                          mx: 2
                        }}
                      />
                      <Typography variant="body2" fontWeight="600">
                        {entry.type}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < scheduleEntries.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};
