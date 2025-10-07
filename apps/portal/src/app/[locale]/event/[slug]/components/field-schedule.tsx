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
  Tooltip
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

interface FieldScheduleProps {
  rounds: FieldRound[];
  eventSlug: string;
}

const FieldSchedule: React.FC<FieldScheduleProps> = ({ rounds }) => {
  const t = useTranslations('pages.event');

  const tables = ['table1', 'table2', 'table3', 'table4', 'table5', 'table6', 'table7', 'table8'];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('quick-links.field-schedule')}
      </Typography>

      <Stack spacing={3} mt={2}>
        {rounds.map((round, roundIndex) => (
          <Paper key={roundIndex} sx={{ p: 2, bgcolor: 'white' }}>
            <TableContainer>
              <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      colSpan={tables.length + 2}
                      align="center"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderTop: '1px solid #ddd',
                        borderBottom: '1px solid #ddd',
                        borderLeft: 'none',
                        borderRight: 'none'
                      }}
                    >
                      <Typography fontWeight={600}>
                        {t('field-schedule.round', {
                          stage: round.stage,
                          number: round.number
                        })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      sx={{
                        width: '80px',
                        bgcolor: 'grey.200',
                        color: 'black',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        borderTop: '1px solid #ddd',
                        borderBottom: '1px solid #ddd',
                        borderLeft: 'none',
                        borderRight: 'none'
                      }}
                    >
                      <Typography fontWeight={600}>{t('field-schedule.match')}</Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        width: '100px',
                        bgcolor: 'grey.200',
                        color: 'black',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        borderTop: '1px solid #ddd',
                        borderBottom: '1px solid #ddd',
                        borderLeft: 'none',
                        borderRight: 'none'
                      }}
                    >
                      <Typography fontWeight={600}>{t('field-schedule.time')}</Typography>
                    </TableCell>
                    {tables.map((_, index) => (
                      <TableCell
                        key={index}
                        sx={{
                          minWidth: '120px',
                          bgcolor: 'grey.200',
                          color: 'black',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          borderTop: '1px solid #ddd',
                          borderBottom: '1px solid #ddd',
                          borderLeft: 'none',
                          borderRight: 'none'
                        }}
                      >
                        <Typography fontWeight={600}>
                          {t('field-schedule.table')} {index + 1}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {round.matches.map((match, matchIndex) => (
                    <TableRow
                      key={matchIndex}
                      sx={{
                        bgcolor: 'white',
                        '& td':
                          matchIndex === 0
                            ? {
                                bgcolor: 'white !important',
                                borderTop: '3px solid white'
                              }
                            : {}
                      }}
                    >
                      <TableCell
                        sx={{
                          textAlign: 'center',
                          borderTop: matchIndex === 0 ? '2px solid #ddd' : 'none',
                          borderBottom: '1px solid #ddd',
                          borderLeft: 'none',
                          borderRight: 'none',
                          py: 1.5
                        }}
                      >
                        <Typography fontWeight={500}>{match.number}</Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'center',
                          borderTop: matchIndex === 0 ? '2px solid #ddd' : 'none',
                          borderBottom: '1px solid #ddd',
                          borderLeft: 'none',
                          borderRight: 'none',
                          py: 1.5
                        }}
                      >
                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                          {dayjs(match.time).format('HH:mm')}
                        </Typography>
                      </TableCell>
                      {tables.map(tableKey => {
                        const team = match.teams[tableKey as keyof typeof match.teams];
                        return (
                          <TableCell
                            key={tableKey}
                            sx={{
                              textAlign: 'center',
                              borderTop: matchIndex === 0 ? '2px solid #ddd' : 'none',
                              borderBottom: '1px solid #ddd',
                              borderLeft: 'none',
                              borderRight: 'none',
                              py: 1.5
                            }}
                          >
                            {team ? (
                              <Tooltip title={team.name} arrow>
                                <Link
                                  component={NextLink}
                                  href={`/teams/${team.number}`}
                                  sx={{
                                    color: 'black',
                                    textDecoration: 'none',
                                    fontWeight: 500,
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
                              <Typography color="text.disabled">-</Typography>
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
        <Box display="flex" alignItems="center" justifyContent="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            {t('field-schedule.no-data')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FieldSchedule;
