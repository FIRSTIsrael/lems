'use client';

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

interface FieldMatch {
  number: number;
  time: string;
  teams: {
    table1?: { number: number; name: string };
    table2?: { number: number; name: string };
    table3?: { number: number; name: string };
    table4?: { number: number; name: string };
    table5?: { number: number; name: string };
    table6?: { number: number; name: string };
    table7?: { number: number; name: string };
    table8?: { number: number; name: string };
  };
}

interface FieldRound {
  stage: string;
  number: number;
  matches: FieldMatch[];
}

interface DivisionFieldScheduleProps {
  rounds: FieldRound[];
  eventSlug: string;
}

export const DivisionFieldSchedule: React.FC<DivisionFieldScheduleProps> = ({ rounds }) => {
  const t = useTranslations('pages.event');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const tables = ['table1', 'table2', 'table3', 'table4', 'table5', 'table6', 'table7', 'table8'];

  return (
    <Paper sx={{ p: 0 }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography variant="h2" gutterBottom>
          {t('quick-links.field-schedule')}
        </Typography>
      </Box>

      <Stack spacing={3} mt={2}>
        {rounds.map((round, roundIndex) => (
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
                          stage: round.stage,
                          number: round.number
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
                  {round.matches.map((match, matchIndex) => (
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
                          {dayjs(match.time).format('HH:mm')}
                        </Typography>
                      </TableCell>
                      {tables.map(tableKey => {
                        const team = match.teams[tableKey as keyof typeof match.teams];
                        return (
                          <TableCell key={tableKey} align="center">
                            {team ? (
                              <Tooltip title={team.name} arrow>
                                <Link
                                  component={NextLink}
                                  href={`/teams/${team.number}`}
                                  sx={{
                                    color: 'black',
                                    textDecoration: 'none',
                                    fontWeight: 500,
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

      {rounds.length === 0 && (
        <Box display="flex" alignItems="center" justifyContent="center" py={4} sx={{ px: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {t('field-schedule.no-data')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
