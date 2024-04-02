import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Event, SafeUser, RoleTypes, EventScheduleEntry } from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import Layout from '../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';
import { enqueueSnackbar } from 'notistack';

interface EventScheduleRowProps {
  entry: EventScheduleEntry;
}

const EventScheduleRow: React.FC<EventScheduleRowProps> = ({ entry }) => {
  return (
    <TableRow
      key={entry.name + entry.roles.toString()}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell>{dayjs(entry.startTime).format('HH:mm')}</TableCell>
      <TableCell>{dayjs(entry.endTime).format('HH:mm')}</TableCell>
      <TableCell>{entry.name}</TableCell>
      <TableCell>{entry.roles.map(r => localizedRoles[r].name).join(', ')}</TableCell>
    </TableRow>
  );
};

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
}

const Page: NextPage<Props> = ({ user, event }) => {
  const router = useRouter();
  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - לו״ז כללי | ${event.name}`}
        back={`/event/${event._id}/reports`}
        backDisabled={false}
        color={event.color}
      >
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>התחלה</TableCell>
                <TableCell>סיום</TableCell>
                <TableCell>שם האירוע</TableCell>
                <TableCell>תפקידים</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {event.schedule?.map((s, index) => {
                return <EventScheduleRow key={index} entry={s} />;
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      { event: `/api/events/${user.eventId}?withSchedule=true` },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
