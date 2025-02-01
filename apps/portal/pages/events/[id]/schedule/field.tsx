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
  useMediaQuery
} from '@mui/material';
import { PortalEvent, PortalFieldSchedule } from '@lems/types';
import { fetchEvent } from '../../../../lib/api';
import { useRealtimeData } from '../../../../hooks/use-realtime-data';
import LoadingAnimation from '../../../../components/loading-animation';
import { localizedMatchStage } from '../../../../lib/localization';
import theme from '../../../../lib/theme';
import StyledEventSubtitle from '../../../../components/events/styled-event-subtitle';

interface Props {
  event: PortalEvent;
}

const Page: NextPage<Props> = ({ event }) => {
  const {
    data: schedule,
    isLoading,
    error
  } = useRealtimeData<PortalFieldSchedule>(`/events/${event.id}/schedule/field`);
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
                    <TableHead sx={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
                      <TableRow>
                        <TableCell
                          align={isDesktop ? 'center' : 'left'}
                          sx={{
                            position: 'sticky',
                            left: 0,
                            background: 'white',
                            width: 'fit-content', // Makes the width fit the content
                            whiteSpace: 'nowrap' // Prevents wrapping
                          }}
                        >
                          <Typography fontWeight={500}>
                            סבב {localizedMatchStage[round.stage]} #{round.number}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography fontWeight={500}>מקצה</Typography>
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
                          <TableCell sx={{ textAlign: 'center' }}>{teams.number}</TableCell>
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
                          {round.schedule.columns.map(column => {
                            const team = teams.data.find(t => t?.column === column.id);
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
