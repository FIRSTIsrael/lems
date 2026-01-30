'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import dayjs from 'dayjs';
import { useMatchTranslations } from '@lems/localization';
import type { TournamentManagerData } from '../graphql';

interface ScheduleReferenceProps {
  division: TournamentManagerData['division'];
}

export function ScheduleReference({ division }: ScheduleReferenceProps) {
  const t = useTranslations('pages.tournament-manager');
  const { getStage } = useMatchTranslations();
  const [activeTab, setActiveTab] = useState(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'default';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not-started':
        return t('status.not-started');
      case 'in-progress':
        return t('status.in-progress');
      case 'completed':
        return t('status.completed');
      default:
        return status;
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
          '& .MuiTab-root': {
            fontWeight: 600,
            fontSize: '0.9rem',
            py: 2
          }
        }}
      >
        <Tab label={t('match-schedule')} />
        <Tab label={t('judging-schedule')} />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
        {activeTab === 0 && (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      py: 2
                    }}
                  >
                    {t('match')}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      py: 2
                    }}
                  >
                    {t('time')}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      py: 2
                    }}
                  >
                    {t('status-column')}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      py: 2
                    }}
                  >
                    {t('participants')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {division.field.matches.map((match, index) => (
                  <TableRow
                    key={match.id}
                    sx={{
                      bgcolor:
                        match.id === division.field.loadedMatch
                          ? 'action.selected'
                          : match.id === division.field.activeMatch
                            ? 'warning.light'
                            : index % 2 === 0
                              ? 'background.paper'
                              : 'action.hover',
                      '&:hover': {
                        bgcolor:
                          match.id === division.field.loadedMatch
                            ? 'action.selected'
                            : match.id === division.field.activeMatch
                              ? 'warning.light'
                              : 'action.hover'
                      },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                          {getStage(match.stage)} #{match.number}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.8rem' }}
                        >
                          Round {match.round}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        fontWeight={600}
                        sx={{ fontSize: '0.95rem' }}
                      >
                        {dayjs(match.scheduledTime).format('HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Chip
                        label={getStatusLabel(match.status)}
                        size="small"
                        color={getStatusColor(match.status)}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 28
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Stack spacing={1}>
                        {match.participants.map(p => (
                          <Box key={p.id}>
                            <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                              <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {p.table.name}:
                              </Box>{' '}
                              {p.team ? (
                                <>
                                  <Box component="span" sx={{ fontWeight: 600 }}>
                                    #{p.team.number}
                                  </Box>{' '}
                                  {p.team.name}
                                </>
                              ) : (
                                <Box
                                  component="span"
                                  sx={{ color: 'text.disabled', fontStyle: 'italic' }}
                                >
                                  -
                                </Box>
                              )}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 1 && (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      py: 2
                    }}
                  >
                    {t('time')}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      py: 2
                    }}
                  >
                    {t('room')}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      py: 2
                    }}
                  >
                    {t('team')}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      py: 2
                    }}
                  >
                    {t('status-column')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {division.judging.sessions.map((session, index) => (
                  <TableRow
                    key={session.id}
                    sx={{
                      bgcolor: session.called
                        ? 'info.light'
                        : index % 2 === 0
                          ? 'background.paper'
                          : 'action.hover',
                      '&:hover': {
                        bgcolor: session.called ? 'info.light' : 'action.hover'
                      },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        fontWeight={600}
                        sx={{ fontSize: '0.95rem' }}
                      >
                        {dayjs(session.scheduledTime).format('HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.9rem' }}>
                        {session.room.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                        {session.team ? (
                          <>
                            <Box component="span" sx={{ fontWeight: 600 }}>
                              #{session.team.number}
                            </Box>{' '}
                            {session.team.name}
                          </>
                        ) : (
                          <Box
                            component="span"
                            sx={{ color: 'text.disabled', fontStyle: 'italic' }}
                          >
                            -
                          </Box>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={getStatusLabel(session.status)}
                          size="small"
                          color={getStatusColor(session.status)}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 28
                          }}
                        />
                        {session.called && (
                          <Chip
                            label={t('called')}
                            size="small"
                            color="info"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 28
                            }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Paper>
  );
}
