import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import dayjs from 'dayjs';
import {
  Container,
  Paper,
  Stack,
  Table,
  Typography,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TableHead
} from '@mui/material';
import { PortalAward, PortalEvent, PortalTeam } from '@lems/types';
import { fetchAwards, fetchEvent } from '../../../lib/api';
import LiveIcon from '../../../components/live-icon';
import EventInfo from '../../../components/events/event-info';
import EventQuickLinks from '../../../components/events/event-quick-links';

interface Props {
  event: PortalEvent;
  teams: PortalTeam[];
  awards: PortalAward[];
}

const Page: NextPage<Props> = ({ event, teams, awards }) => {
  const isLive = dayjs(event.date).isSame(dayjs(), 'day');

  return (
    <Container maxWidth="md" sx={{ my: 2 }}>
      <Typography variant="h1">{event.name}</Typography>
      {isLive && (
        <Paper sx={{ p: 2, my: 2, width: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h2" maxWidth="90%">
              אירוע פעיל
            </Typography>
            <LiveIcon />
          </Stack>
          <Typography variant="h2">Event status info</Typography>
        </Paper>
      )}
      <EventInfo event={event} teamCount={teams.length} />
      <EventQuickLinks event={event} awards={awards} teams={teams} />
      <Typography variant="h2">קבוצות באירוע</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography fontWeight={500}>קבוצה</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={500}>מיקום</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map(team => (
              <TableRow key={team.id}>
                <TableCell>
                  {team.name} #{team.number}
                </TableCell>
                <TableCell>{`${team.affiliation.name}, ${team.affiliation.city}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const { event, teams } = await fetchEvent(eventId);
  const awards = await fetchAwards(eventId);
  return { props: { event, teams, awards } };
};

export default Page;
