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
  Chip
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
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={t('match-schedule')} />
        <Tab label={t('judging-schedule')} />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 0 && (
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('match')}</TableCell>
                  <TableCell>{t('time')}</TableCell>
                  <TableCell>{t('status')}</TableCell>
                  <TableCell>{t('participants')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {division.field.matches.map(match => (
                  <TableRow
                    key={match.id}
                    sx={{
                      bgcolor:
                        match.id === division.field.loadedMatch
                          ? 'action.selected'
                          : match.id === division.field.activeMatch
                            ? 'warning.light'
                            : undefined
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {getStage(match.stage)} #{match.number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Round {match.round}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {dayjs(match.scheduledTime).format('HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(match.status)}
                        size="small"
                        color={getStatusColor(match.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {match.participants.map(p => (
                          <Typography key={p.id} variant="body2">
                            <strong>{p.table.name}:</strong>{' '}
                            {p.team ? `#${p.team.number} ${p.team.name}` : '-'}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 1 && (
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('time')}</TableCell>
                  <TableCell>{t('room')}</TableCell>
                  <TableCell>{t('team')}</TableCell>
                  <TableCell>{t('status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {division.judging.sessions.map(session => (
                  <TableRow
                    key={session.id}
                    sx={{
                      bgcolor: session.called ? 'info.light' : undefined
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {dayjs(session.scheduledTime).format('HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{session.room.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {session.team ? `#${session.team.number} ${session.team.name}` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(session.status)}
                        size="small"
                        color={getStatusColor(session.status)}
                      />
                      {session.called && (
                        <Chip label={t('called')} size="small" color="info" sx={{ ml: 1 }} />
                      )}
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
