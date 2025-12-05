'use client';

import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import { Match, MatchStage, MatchStatus } from './scorekeeper.graphql';

interface MatchScheduleTableProps {
  matches: Match[];
  currentStage: MatchStage;
  loadedMatchId?: string | null;
}

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

const formatScheduledTime = (isoTime: string) => {
  const date = new Date(isoTime);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

interface TeamsCellProps {
  participants: Match['participants'];
}

const TeamsCell = ({ participants }: TeamsCellProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      {participants.map((p, idx) => (
        <Box key={idx} sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              minWidth: '2.5rem',
              textAlign: 'right',
              fontFamily: 'monospace'
            }}
          >
            #{p.team?.number || '—'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {p.table?.name || 'Unknown'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export function MatchScheduleTable({
  matches,
  currentStage,
  loadedMatchId
}: MatchScheduleTableProps) {
  const t = useTranslations('pages.scorekeeper.schedule');
  const { getStage, getStatus } = useMatchTranslations();

  // Filter to only show matches in current stage, excluding test match
  const filteredMatches = matches.filter(m => m.stage === currentStage && m.stage !== 'TEST');

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
            <TableCell
              align="right"
              sx={{ color: 'primary.contrastText', fontWeight: 600, width: '13%' }}
            >
              {t('actions')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredMatches.map(match => {
            const isLoaded = match.id === loadedMatchId;
            const isDisabled = match.status !== 'not-started' || isLoaded;

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
                    {formatScheduledTime(match.scheduledTime)}
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
                <TableCell align="right">
                  <Button
                    size="small"
                    variant={isLoaded ? 'contained' : 'outlined'}
                    disabled={isDisabled}
                    onClick={() => {
                      // TODO: Implement load match mutation
                      console.log('Load match:', match.id);
                    }}
                  >
                    {isLoaded ? t('loaded') : t('load')}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
