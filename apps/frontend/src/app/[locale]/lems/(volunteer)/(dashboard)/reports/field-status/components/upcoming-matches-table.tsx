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
  Tooltip
} from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import { useTime } from '../../../../../../../../lib/time/hooks';
import type { Match } from '../graphql';

interface TeamsCellProps {
  participants: Match['participants'];
}

const TeamsCell = ({ participants }: TeamsCellProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 3,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      {[...participants]
        .sort((a, b) => {
          const numA = parseInt(a.table.name.match(/\d+/)?.[0] || '0', 10);
          const numB = parseInt(b.table.name.match(/\d+/)?.[0] || '0', 10);
          return numA - numB;
        })
        .map((participant, idx) => {
          const { team, table } = participant;
          const teamNumber = team?.number ? `#${team.number}` : '—';

          return (
            <Box key={idx} sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontSize: '1.1rem', fontWeight: 500 }}
              >
                {table?.name || 'Unknown'}
              </Typography>
              <Tooltip title={team ? `${team.name}` : ''} arrow>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    minWidth: '2.5rem',
                    fontFamily: 'monospace',
                    fontSize: '1.1rem'
                  }}
                >
                  {teamNumber}
                </Typography>
              </Tooltip>
            </Box>
          );
        })}
    </Box>
  );
};

interface UpcomingMatchesTableProps {
  matches: Match[];
  loadedMatchId?: string | null;
}

export const UpcomingMatchesTable: React.FC<UpcomingMatchesTableProps> = ({
  matches,
  loadedMatchId
}) => {
  const t = useTranslations('pages.reports.field-status.upcoming-matches');
  const { getStage } = useMatchTranslations();
  const currentTime = useTime({ interval: 1000 });

  if (matches.length === 0) {
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
            <TableCell
              sx={{
                color: 'primary.contrastText',
                fontWeight: 700,
                width: '12%',
                fontSize: '1.1rem'
              }}
            >
              {t('match-number')}
            </TableCell>
            <TableCell
              sx={{
                color: 'primary.contrastText',
                fontWeight: 700,
                width: '12%',
                fontSize: '1.1rem'
              }}
            >
              {t('scheduled-time')}
            </TableCell>
            <TableCell
              sx={{
                color: 'primary.contrastText',
                fontWeight: 700,
                width: '65%',
                fontSize: '1.1rem'
              }}
            >
              {t('teams')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map(match => {
            const isLoaded = match.id === loadedMatchId;
            const scheduledTime = currentTime
              .set('hour', dayjs(match.scheduledTime).hour())
              .set('minute', dayjs(match.scheduledTime).minute())
              .set('second', 0);

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
                  <Typography variant="body2" sx={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {getStage(match.stage)} #{match.number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 700 }}
                  >
                    {scheduledTime.format('HH:mm')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <TeamsCell participants={match.participants} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
