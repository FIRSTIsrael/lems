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
import { JudgingSession } from '../../graphql';
import { RubricStatusButton } from './rubric-status-button';
import { TeamInfoCell } from './team-info-cell';
import { StartSessionButton } from './start-session-button';
import { RubricStatusGlossary } from './rubric-status-glossary';

interface RoomScheduleTableProps {
  onStartSession: (sessionId: string) => Promise<void>;
  sessions: JudgingSession[];
  loading?: boolean;
}

export const RoomScheduleTable: React.FC<RoomScheduleTableProps> = ({
  onStartSession,
  sessions,
  loading = false
}) => {
  const t = useTranslations('pages.judge.schedule');
  const theme = useTheme();

  const sortedSessions = useMemo(() => {
    return [...sessions].filter(session => !!session.team).sort((a, b) => a.number - b.number);
  }, [sessions]);

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ height: 20, bgcolor: 'action.disabledBackground', borderRadius: 1 }} />
          <Box sx={{ height: 400, bgcolor: 'action.disabledBackground', borderRadius: 1 }} />
        </Stack>
      </Paper>
    );
  }

  if (sortedSessions.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {t('no-sessions')}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: theme.shadows[3],
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Table size="medium">
        <TableHead>
          <TableRow
            sx={{
              backgroundColor:
                theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
              '& th': {
                borderBottom: `2px solid ${theme.palette.divider}`,
                fontWeight: 700,
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
                py: 2
              }
            }}
          >
            <TableCell align="center" sx={{ width: '8%' }}>
              {t('session')}
            </TableCell>
            <TableCell align="center" sx={{ width: '12%' }}>
              {t('start-time')}
            </TableCell>
            <TableCell sx={{ width: '25%' }}>{t('team')}</TableCell>
            <TableCell align="center" sx={{ width: '15%' }}>
              {t('actions')}
            </TableCell>
            <TableCell align="center" sx={{ width: '40%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary
                  }}
                >
                  {t('rubrics')}
                </Typography>
                <RubricStatusGlossary />
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedSessions.map((session, index) => {
            const isActive = session.status === 'in-progress';
            const formattedTime = new Date(session.scheduledTime).toLocaleTimeString('he-IL', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <TableRow
                key={session.id}
                sx={{
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: isActive
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(33, 150, 243, 0.12)'
                      : 'rgba(33, 150, 243, 0.08)'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.02)'
                  },
                  borderBottom:
                    index === sortedSessions.length - 1
                      ? 'none'
                      : `1px solid ${theme.palette.divider}`
                }}
              >
                <TableCell align="center" sx={{ py: 2.5 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: isActive
                        ? theme.palette.primary.main
                        : theme.palette.mode === 'dark'
                          ? theme.palette.grey[800]
                          : theme.palette.grey[200],
                      color: isActive
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }}
                  >
                    #{session.number}
                  </Box>
                </TableCell>

                <TableCell align="center" sx={{ py: 2.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {formattedTime}
                  </Typography>
                </TableCell>

                <TableCell sx={{ py: 2.5 }}>
                  <TeamInfoCell team={session.team} />
                </TableCell>

                <TableCell align="center" sx={{ py: 2.5 }}>
                  <StartSessionButton session={session} onStartSession={onStartSession} />
                </TableCell>

                <TableCell sx={{ py: 2.5 }}>
                  <Stack direction="row" spacing={1.5} justifyContent="center">
                    <RubricStatusButton
                      category="innovation-project"
                      status={session.rubrics?.innovation_project?.status}
                      label={t('rubric-labels.innovation-project')}
                      disabled={session.status !== 'completed'}
                      teamSlug={session.team.slug}
                    />
                    <RubricStatusButton
                      category="robot-design"
                      status={session.rubrics?.robot_design?.status}
                      label={t('rubric-labels.robot-design')}
                      disabled={session.status !== 'completed'}
                      teamSlug={session.team.slug}
                    />
                    <RubricStatusButton
                      category="core-values"
                      status={session.rubrics?.coreValues?.status}
                      label={t('rubric-labels.core-values')}
                      disabled={session.status !== 'completed'}
                      teamSlug={session.team.slug}
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
