import { GetStaticPaths, GetStaticProps, GetStaticPropsContext, NextPage } from 'next';
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
  Box
} from '@mui/material';
import { PortalEvent, PortalJudgingSchedule } from '@lems/types';
import { fetchEvent } from '../../../../lib/api';
import { useRealtimeData } from '../../../../hooks/use-realtime-data';
import LoadingAnimation from '../../../../components/loading-animation';
import StyledEventSubtitle from '../../../../components/events/styled-event-subtitle';
import PageError from '../../../../components/page-error';

interface Props {
  event: PortalEvent;
}

const Page: NextPage<Props> = ({ event }) => {
  if (!event) return <PageError statusCode={404} />

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
                    <TableCell>
                      <Typography fontWeight={500}>סבב</Typography>
                    </TableCell>
                    <TableCell>
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
                      <TableCell>{dayjs.unix(Number(time)).format('HH:mm')}</TableCell>
                      {schedule.columns.map(column => {
                        const team = session.data.find(t => t?.column === column.id);
                        return (
                          <TableCell key={column.id}>{team ? `#${team.number}` : ''}</TableCell>
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

export const getStaticProps: GetStaticProps = async ({ params }: GetStaticPropsContext) => {
  const eventId = params?.id as string;

  const { event } = await fetchEvent(eventId);
  return {
    props: { event },
    revalidate: 10 * 60 // 10 minutes
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  // We don't know the events at build time, Next.js will generate the pages at runtime.
  return { paths: [], fallback: true };
}

export default Page;
