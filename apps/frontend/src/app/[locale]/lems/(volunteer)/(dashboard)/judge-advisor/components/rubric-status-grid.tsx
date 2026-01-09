'use client';

import { useState } from 'react';
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
  Button,
  ButtonGroup
} from '@mui/material';
import { JUDGING_CATEGORIES } from '@lems/types/judging';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { useFilteredSessions } from '../hooks/use-filtered-sessions';
import { TeamInfoCell } from './team-info-cell';
import { RubricStatusButton } from './rubric-status-button';
import { StatusFilterSelector } from './status-filter-selector';
import { RubricStatusGlossary } from './rubric-status-glossary';
import { useJudgeAdvisor } from './judge-advisor-context';

export const RubricStatusGrid = () => {
  const { sessions, loading } = useJudgeAdvisor();
  const t = useTranslations('pages.judge-advisor.grid');
  const { getCategory } = useJudgingCategoryTranslations();
  const theme = useTheme();

  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'room' | 'session'>('room');

  const statuses = ['not-started', 'in-progress', 'completed'];

  const sortedAndFilteredSessions = useFilteredSessions(sessions, {
    teamFilter,
    statusFilter,
    sortBy
  });

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
          <StatusFilterSelector
            statuses={statuses}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
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
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            <RubricStatusGlossary />
          </Box>
          {(teamFilter || statusFilter.length > 0) && (
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
              <TableCell sx={{ fontWeight: 600, width: '13%' }}>{t('column.session')}</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '12%' }}>{t('column.room')}</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '20%' }}>{t('column.team')}</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '12%' }} align="center">
                {t('column.status')}
              </TableCell>
              {JUDGING_CATEGORIES.map(category => (
                <TableCell
                  key={category}
                  sx={{
                    fontWeight: 600,
                    width: '14%',
                    textAlign: 'center',
                    fontSize: '0.85rem'
                  }}
                >
                  {getCategory(category)}
                </TableCell>
              ))}
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
                {JUDGING_CATEGORIES.map(category => (
                  <TableCell key={category} align="center" sx={{ p: 1 }}>
                    <RubricStatusButton
                      category={category}
                      status={session.rubrics[hyphensToUnderscores(category)]?.status || 'empty'}
                      label={getCategory(category)}
                      teamSlug={session.team.slug}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
