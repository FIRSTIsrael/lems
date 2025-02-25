import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
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
  Container,
  Box,
  Stack,
  useMediaQuery,
  Link
} from '@mui/material';
import { PortalEvent, PortalFieldSchedule } from '@lems/types';
import { fetchEvent } from '../../../../lib/api';
import { useRealtimeData } from '../../../../hooks/use-realtime-data';
import LoadingAnimation from '../../../../components/loading-animation';
import { localizedMatchStage } from '../../../../lib/localization';
import theme from '../../../../lib/theme';
import StyledEventSubtitle from '../../../../components/events/styled-event-subtitle';

interface Props {
  eventId: string;
  event: PortalEvent;
}

const Page: NextPage<Props> = ({ eventId, event }) => {
  const {
    data: schedule,
    isLoading,
    error
  } = useRealtimeData<PortalFieldSchedule>(`/events/${eventId}/schedule/field`);
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h2">לוח זמנים - זירה</Typography>
      <StyledEventSubtitle event={event} />
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          mb: 2
        }}
      >
        {(isLoading || error) && <LoadingAnimation />}
        {!isLoading && !error && (
          <Stack spacing={2} mt={2}>
            {schedule.rounds.map((round, index) => (
              <Paper key={index} sx={{ p: 2 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          colSpan={round.schedule.columns.length + 2}
                          align={isDesktop ? 'center' : 'left'}
                        >
                          <Typography fontWeight={500}>
                            סבב {localizedMatchStage[round.stage]} #{round.number}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography fontWeight={500}>מקצה</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>זמן התחלה</Typography>
                        </TableCell>
                        {round.schedule.columns.map(column => (
                          <TableCell key={column.id}>
                            <Typography fontWeight={500}>{column.name}</Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(round.schedule.rows).map(([time, teams]) => (
                        <TableRow
                          key={time}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell>{teams.number}</TableCell>
                          <TableCell>{dayjs.unix(Number(time)).format('HH:mm')}</TableCell>
                          {round.schedule.columns.map(column => {
                            const team = teams.data.find(t => t?.column === column.id);
                            return (
                              <TableCell key={column.id}>
                                {team ? (
                                  <Link
                                    href={`/events/${eventId}/teams/${team.number}`}
                                    sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                  >
                                    #{team.number}
                                  </Link>
                                ) : ''}
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
        )}
      </Box>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;

  const { event } = await fetchEvent(eventId);
  return { props: { event } };
};

export default Page;
