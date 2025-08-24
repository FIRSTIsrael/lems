import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
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
  Container,
  Box,
  Link
} from '@mui/material';
import { PortalEvent, PortalJudgingSchedule } from '@lems/types';
import { fetchEvent } from '../../../../lib/api';
import { getMessages } from '../../../../locale/get-messages';
import { useRealtimeData } from '../../../../../src/hooks/use-realtime-data';
import LoadingAnimation from '../../../../components/loading-animation';
import StyledEventSubtitle from '../../../../components/events/styled-event-subtitle';

interface Props {
  event: PortalEvent;
}

const Page: NextPage<Props> = ({ event }) => {
  const t = useTranslations('pages.events.id.schedule.judging');

  const {
    data: schedule,
    isLoading,
    error
  } = useRealtimeData<PortalJudgingSchedule>(`/events/${event.id}/schedule/judging`);

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h2">{t('title')}</Typography>
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
                      <Typography fontWeight={500}>{t('table.columns.round')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{t('table.columns.start-time')}</Typography>
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
  const messages = await getMessages(ctx.locale);
  return { props: { event, messages } };
};

export default Page;
