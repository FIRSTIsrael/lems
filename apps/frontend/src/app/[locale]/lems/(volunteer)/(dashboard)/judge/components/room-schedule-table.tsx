'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import type { JudgingSession } from '../judge.graphql';
import { SessionStatusIndicator } from './session-status-indicator';
import { RubricStatusButton, type RubricStatus } from './rubric-status-button';
import { TeamInfoCell } from './team-info-cell';

interface RoomScheduleTableProps {
  sessions: JudgingSession[];
  loading?: boolean;
}

export const RoomScheduleTable: React.FC<RoomScheduleTableProps> = ({
  sessions,
  loading = false
}) => {
  const t = useTranslations('pages.judge.schedule');
  const theme = useTheme();

  // Mock rubric status mapping - in phase 2 this will come from GraphQL
  const getRubricStatus = (): RubricStatus => {
    return 'empty';
  };

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => a.number - b.number);
  }, [sessions]);

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ height: 20, bgcolor: 'action.disabledBackground', borderRadius: 1 }} />
          <Box sx={{ height: 200, bgcolor: 'action.disabledBackground', borderRadius: 1 }} />
        </Stack>
      </Paper>
    );
  }

  if (sortedSessions.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t('no-sessions')}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: theme.shadows[2],
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      <Table size="medium">
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: theme.palette.action.hover,
              '& th': {
                borderBottomWidth: 1,
                borderColor: theme.palette.divider
              }
            }}
          >
            <TableCell align="center" sx={{ fontWeight: 700, width: '8%', py: 1.5 }}>
              {t('session')}
            </TableCell>
            <TableCell sx={{ fontWeight: 700, width: '30%', py: 1.5 }}>{t('team')}</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, width: '30%', py: 1.5 }}>
              {t('statusLabel')}
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, width: '32%', py: 1.5 }}>
              {t('rubricsLabel')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedSessions.map((session, index) => {
            const statusConfig = {
              scheduled: 'scheduled' as const,
              'in-progress': 'in-progress' as const,
              completed: 'completed' as const,
              aborted: 'aborted' as const
            };

            return (
              <TableRow
                key={session.id}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  },
                  backgroundColor:
                    session.status === 'in-progress'
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'rgba(25, 118, 210, 0.05)'
                      : undefined,
                  transition: 'background-color 0.2s ease-in-out',
                  borderBottom: index === sortedSessions.length - 1 ? 'none' : undefined
                }}
              >
                <TableCell align="center" sx={{ py: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    #{session.number}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <TeamInfoCell team={session.team} />
                </TableCell>
                <TableCell align="center" sx={{ py: 1.5 }}>
                  <SessionStatusIndicator
                    status={statusConfig[session.status as keyof typeof statusConfig]}
                    sessionNumber={session.number}
                    scheduledTime={new Date(session.scheduledTime).toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  />
                </TableCell>
                <TableCell align="center" sx={{ py: 1.5 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    sx={{ flexWrap: 'wrap' }}
                  >
                    <RubricStatusButton
                      type="core-values"
                      status={getRubricStatus()}
                      label={t('rubrics.core-values')}
                    />
                    <RubricStatusButton
                      type="innovation-project"
                      status={getRubricStatus()}
                      label={t('rubrics.innovation-project')}
                    />
                    <RubricStatusButton
                      type="robot-design"
                      status={getRubricStatus()}
                      label={t('rubrics.robot-design')}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
