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
  Link
} from '@mui/material';
import { PortalEvent, PortalJudgingSchedule } from '@lems/types';
import { fetchEvent } from '../../../../lib/api';
import { useRealtimeData } from '../../../../hooks/use-realtime-data';
import LoadingAnimation from '../../../../components/loading-animation';
import StyledEventSubtitle from '../../../../components/events/styled-event-subtitle';

interface Props {
  event: PortalEvent;
}

const Page: NextPage<Props> = ({ event }) => {
  const {
    data: schedule,
    isLoading,
    error
  } = useRealtimeData<PortalJudgingSchedule>(`/events/${event.id}/schedule/judging`);

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h2">לוח זמנים - שיפוט</Typography>
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
          <Paper sx={{ p: 2, mt: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        background: 'white'
                      }}
                    >
                      <Typography fontWeight={500}>סבב</Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        background: 'white',
                        boxShadow: '2px 0 5px -2px rgba(0,0,0,0.2)'
                      }}
                    >
                      <Typography fontWeight={500}>זמן התחלה</Typography>
                    </TableCell>
                    {schedule.columns.map(column => (
                      <TableCell key={column.id}>
                        <Typography fontWeight={500}>{column.name}</Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(schedule.rows).map(([time, session]) => (
                    <TableRow key={time} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{session.number}</TableCell>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          background: 'white',
                          boxShadow: '2px 0 5px -2px rgba(0,0,0,0.2)'
                        }}
                      >
                        {dayjs.unix(Number(time)).format('HH:mm')}
                      </TableCell>
                      {schedule.columns.map(column => {
                        const team = session.data.find(t => t?.column === column.id);
                        return (
                          <TableCell key={column.id}>
                            {team ? (
                              <Link
                                href={`/events/${event.id}/teams/${team.number}`}
                                sx={{
                                  color: 'inherit',
                                  textDecoration: 'none',
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                              >
                                #{team.number}
                              </Link>
                            ) : (
                              ''
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
