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
  Chip,
  Stack
} from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import type { MatchStatus } from '../graphql/types';
import { useMc } from './mc-context';

const getStatusColor = (status: MatchStatus) => {
  switch (status) {
    case 'not-started':
      return 'default';
    case 'in-progress':
      return 'success';
    case 'completed':
      return 'info';
  }
};

export const MatchScheduleTable: React.FC = () => {
  const { matches, currentStage } = useMc();
  const t = useTranslations('pages.mc.schedule');
  const { getStage, getStatus } = useMatchTranslations();

  const currentStageMatches = matches.filter(
    match => match.stage === currentStage && match.status !== 'completed'
  );

  if (currentStageMatches.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="textSecondary">{t('no-matches')}</Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('title')}
        </Typography>
      </Box>
      <TableContainer>
        <Table size="medium" sx={{ '& .MuiTableCell-root': { py: 2 } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600, width: '15%' }}>
                {t('match-number')}
              </TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600, width: '12%' }}>
                {t('scheduled-time')}
              </TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600, width: '58%' }}>
                {t('teams')}
              </TableCell>
              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600, width: '15%' }}>
                {t('status')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentStageMatches.map(match => (
              <TableRow
                key={match.id}
                sx={{
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {getStage(match.stage)} #{match.number}
                  </Typography>
                  {match.round && (
                    <Typography variant="body2" color="textSecondary">
                      {t('round')} {match.round}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {dayjs(match.scheduledTime).format('HH:mm')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    {match.participants.map(participant => (
                      <Box key={participant.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={participant.table.name}
                            size="small"
                            variant="outlined"
                            sx={{ minWidth: 60, fontWeight: 600 }}
                          />
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            #{participant.team?.number || '—'}
                          </Typography>
                          <Typography variant="body1">
                            {participant.team?.name || t('no-team')}
                          </Typography>
                          {participant.team && (
                            <Typography variant="body1" color="textSecondary">
                              • {participant.team.affiliation}, {participant.team.city}
                            </Typography>
                          )}
                          {participant.team && !participant.team.arrived && (
                            <Chip
                              label={t('not-arrived')}
                              size="small"
                              color="warning"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatus(match.status)}
                    size="small"
                    color={getStatusColor(match.status)}
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
