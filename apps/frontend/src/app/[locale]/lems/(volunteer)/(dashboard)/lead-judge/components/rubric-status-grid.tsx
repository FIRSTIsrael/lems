'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  useTheme,
  Chip,
  TextField,
  Stack,
  MenuItem,
  Button,
  ButtonGroup
} from '@mui/material';
import { JudgingSessionAdvisor } from '../lead-judge.graphql';
import { TeamInfoCell } from './team-info-cell';
import { RubricStatusButton } from './rubric-status-button';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/types/judging';

interface RubricStatusGridProps {
  sessions: JudgingSessionAdvisor[];
  category: JudgingCategory;
  loading?: boolean;
}

export const RubricStatusGrid: React.FC<RubricStatusGridProps> = ({
  sessions,
  category,
  loading = false
}) => {
  const t = useTranslations('pages.judge-advisor.grid');
  const { getCategory } = useJudgingCategoryTranslations();
  const theme = useTheme();

  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'room' | 'session'>('room');

  const sortedAndFilteredSessions : JudgingSessionAdvisor[]= useMemo(() => {
    let filtered = [...sessions];

    if (teamFilter) {
      const lowerFilter = teamFilter.toLowerCase();
      filtered = filtered.filter(
        session =>
          session.team.number.toLowerCase().includes(lowerFilter) ||
          session.team.name.toLowerCase().includes(lowerFilter) ||
          session.team.affiliation.toLowerCase().includes(lowerFilter)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    if (sortBy === 'room') {
      return filtered.sort((a, b) => {
        if (a.room.name !== b.room.name) {
          return a.room.name.localeCompare(b.room.name);
        }
        return a.number - b.number;
      });
    } else {
      return filtered.sort((a, b) => a.number - b.number);
    }
  }, [sessions, teamFilter, statusFilter, sortBy]);

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return '#2196f3';
      case 'completed':
        return '#4caf50';
      case 'not-started':
        return '#9e9e9e';
      default:
        return '#757575';
    }
  };

  const getSessionStatusLabel = (status: string) => {
    return t(`session-status.${status}`) || status;
  };

  if (loading) {
    return (
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ height: 20, bgcolor: 'action.disabledBackground', borderRadius: 1, mb: 2 }} />
          <Box sx={{ height: 400, bgcolor: 'action.disabledBackground', borderRadius: 1 }} />
        </Box>
      </Paper>
    );
  }

  if (sessions.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography color="textSecondary">{t('empty-state')}</Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label={t('filter.team')}
            placeholder={t('filter.team-placeholder')}
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            select
            label={t('filter.status')}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
          >
            <MenuItem value="">{t('filter.all-statuses')}</MenuItem>
            <MenuItem value="not-started">{t('session-status.not-started')}</MenuItem>
            <MenuItem value="in-progress">{t('session-status.in-progress')}</MenuItem>
            <MenuItem value="completed">{t('session-status.completed')}</MenuItem>
          </TextField>
          <ButtonGroup size="small" variant="outlined">
            <Button
              onClick={() => setSortBy('room')}
              variant={sortBy === 'room' ? 'contained' : 'outlined'}
            >
              {t('sort.room')}
            </Button>
            <Button
              onClick={() => setSortBy('session')}
              variant={sortBy === 'session' ? 'contained' : 'outlined'}
            >
              {t('sort.session')}
            </Button>
          </ButtonGroup>
          {(teamFilter || statusFilter) && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                {t('filter.results')}: {sortedAndFilteredSessions.length}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>

    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table sx={{ minWidth: 900 }}>
        <TableHead
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
            borderBottom: `2px solid ${theme.palette.divider}`
          }}
        >
          <TableRow>
            <TableCell sx={{ fontWeight: 600, width: '13%' }}>
              {t('column.session')}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, width: '12%' }}>
              {t('column.room')}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, width: '20%' }}>
              {t('column.team')}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, width: '12%' }} align="center">
              {t('column.status')}
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                width: '14%',
                textAlign: 'center',
                fontSize: '0.85rem'
              }}
            >
              {getCategory(category)}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedAndFilteredSessions.map((session, idx) => (
            <TableRow
              key={session.id}
              sx={{
                backgroundColor:
                  idx % 2 === 0
                    ? 'transparent'
                    : theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(0, 0, 0, 0.01)',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.02)'
                },
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  #{session.number}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{session.room.name}</Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TeamInfoCell team={session.team} />
                </Box>
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={getSessionStatusLabel(session.status)}
                  size="small"
                  sx={{
                    backgroundColor: getSessionStatusColor(session.status),
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </TableCell>
              <TableCell align="center" sx={{ p: 1 }}>
                <RubricStatusButton
                  category={category}
                  status={session.rubrics[category as keyof typeof session.rubrics]?.status || 'empty'}
                  label={getCategory(category)}
                  teamSlug={session.team.slug}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );
};
