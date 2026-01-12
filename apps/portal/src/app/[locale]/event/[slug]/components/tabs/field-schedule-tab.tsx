'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  TableBody,
  Paper,
  Box,
  Stack,
  Link,
  Tooltip,
  useMediaQuery,
  useTheme,
  alpha
} from '@mui/material';
import NextLink from 'next/link';
import { RobotGameMatch } from '@lems/types/api/portal';
import { useMatchTranslations } from '@lems/localization';
import { useRealtimeData } from '../../../../hooks/use-realtime-data';
import { useDivision } from '../division-data-context';

export const FieldScheduleTab: React.FC = () => {
  const t = useTranslations('pages.event');
  const { getStage } = useMatchTranslations();

  const params = useParams();
  const eventSlug = params.slug as string;

  const division = useDivision();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: fieldSchedule } = useRealtimeData<RobotGameMatch[]>(
    `/portal/divisions/${division.id}/schedule/field`,
    { suspense: true }
  );

  if (!fieldSchedule) {
    return null; // Should be handled by suspense fallback
  }

  // Group matches by round (stage + number)
  const groupedMatches = fieldSchedule.reduce(
    (acc, match) => {
      if (match.stage === 'TEST') {
        return acc;
      }
      const key = `${match.stage}-${match.round}`;
      if (!acc[key]) {
        acc[key] = { stage: match.stage, round: match.round, matches: [] };
      }
      acc[key].matches.push(match);
      return acc;
    },
    {} as Record<string, { stage: string; round: number; matches: RobotGameMatch[] }>
  );

  // Extract unique tables from all matches
  const tablesMap = new Map<string, { id: string; name: string }>();
  fieldSchedule.forEach(match => {
    match.participants.forEach(participant => {
      tablesMap.set(participant.table.id, participant.table);
    });
  });
  const tables = Array.from(tablesMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Paper sx={{ p: 0 }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography variant="h2" gutterBottom>
          {t('quick-links.field-schedule')}
        </Typography>
      </Box>

      <Stack spacing={3} mt={2}>
        {Object.values(groupedMatches).map((roundObject, roundIndex) => (
          <Paper key={roundIndex} sx={{ p: 0, bgcolor: 'white' }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table
                size="small"
                sx={{
                  tableLayout: 'fixed',
                  width: '100%',
                  minWidth: 800
                }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell
                      colSpan={tables.length + 2}
                      align="center"
                      sx={{
                        color: 'primary.main',
                        border: 'none'
                      }}
                    >
                      <Typography fontWeight={500}>
                        {t('field-schedule.round', {
                          stage: getStage(roundObject.stage),
                          number: roundObject.round
                        })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell width={isMobile ? 60 : 80} align="center">
                      <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                        {t('field-schedule.match')}
                      </Typography>
                    </TableCell>
                    <TableCell width={isMobile ? 70 : 100} align="center">
                      <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                        {t('field-schedule.time')}
                      </Typography>
                    </TableCell>
                    {tables.map((_, index) => (
                      <TableCell key={index} width={isMobile ? 80 : 120} align="center">
                        <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                          {t('field-schedule.table')} {index + 1}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roundObject.matches.map((match, matchIndex) => (
                    <TableRow key={matchIndex} sx={{ bgcolor: 'white' }}>
                      <TableCell align="center">
                        <Typography fontWeight={500} fontSize={isMobile ? '0.75rem' : '1rem'}>
                          {match.number}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          fontFamily="monospace"
                          fontWeight={500}
                          fontSize={isMobile ? '0.75rem' : '1rem'}
                        >
                          {dayjs(match.scheduledTime).format('HH:mm')}
                        </Typography>
                      </TableCell>
                      {tables.map(table => {
                        const participant = match.participants.find(p => p.table.id === table.id);
                        const team = participant?.team;

                        return (
                          <TableCell key={table.id} align="center">
                            {team ? (
                              <Tooltip title={team.name} arrow>
                                <Link
                                  component={NextLink}
                                  href={`/event/${eventSlug}/team/${team.slug}`}
                                  sx={{
                                    color: 'black',
                                    textDecoration: 'none',
                                    fontSize: isMobile ? '0.75rem' : '1rem',
                                    '&:hover': {
                                      textDecoration: 'underline',
                                      color: 'primary.main'
                                    }
                                  }}
                                >
                                  #{team.number}
                                </Link>
                              </Tooltip>
                            ) : (
                              <Typography
                                color="text.disabled"
                                fontSize={isMobile ? '0.75rem' : '1rem'}
                              >
                                -
                              </Typography>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))}
      </Stack>

      {Object.keys(groupedMatches).length === 0 && (
        <Box display="flex" alignItems="center" justifyContent="center" py={4} sx={{ px: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {t('field-schedule.no-data')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
