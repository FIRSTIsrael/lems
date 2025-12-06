'use client';

import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import { MatchStatus } from '../../scorekeeper.graphql';
import { useScorekeeperData } from '../scorekeeper-context';
import { TeamsCell } from './match-schedule-teams-cell';
import { LoadMatchButton } from './load-match-button';

const getStatusColor = (status: MatchStatus) => {
  switch (status) {
    case 'not-started':
      return 'default';
    case 'completed':
      return 'success';
    case 'in-progress':
      return 'warning';
  }
};

interface MatchScheduleTableProps {
  hideCompleted?: boolean;
}

export const MatchScheduleTable: React.FC<MatchScheduleTableProps> = ({
  hideCompleted = false
}) => {
  const t = useTranslations('pages.scorekeeper.schedule');
  const { getStage, getStatus } = useMatchTranslations();

  const { matches, loadedMatch } = useScorekeeperData();
  let filteredMatches = matches.filter(match => match.stage !== 'TEST');
  if (hideCompleted) {
    filteredMatches = filteredMatches.filter(match => match.status !== 'completed');
  }

  if (filteredMatches.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="textSecondary">{t('no-matches')}</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small" sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600, width: '15%' }}>
              {t('match-number')}
            </TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600, width: '12%' }}>
              {t('scheduled-time')}
            </TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600, width: '50%' }}>
              {t('teams')}
            </TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600, width: '10%' }}>
              {t('status')}
            </TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600, width: '13%' }}>
              {t('actions')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredMatches.map(match => {
            const isLoaded = match.id === loadedMatch?.id;

            return (
              <TableRow
                key={match.id}
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                  ...(isLoaded && {
                    bgcolor: 'action.selected',
                    fontWeight: 500
                  })
                }}
              >
                <TableCell>
                  <Typography variant="body2">
                    {getStage(match.stage)} #{match.number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {dayjs(match.scheduledTime).format('HH:mm')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <TeamsCell participants={match.participants} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatus(match.status)}
                    size="small"
                    color={getStatusColor(match.status)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <LoadMatchButton match={match} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
