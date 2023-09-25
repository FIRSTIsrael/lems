import { useState } from 'react';
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
  TableRow,
  Typography
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import {
  Event,
  Team,
  JudgingRoom,
  SafeUser,
  JudgingSession,
  JUDGING_SESSION_LENGTH
} from '@lems/types';
import BooleanIcon from '../../../../components/general/boolean-icon';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { apiFetch } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';
import { useWebsocket } from '../../../../hooks/use-websocket';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
}

const Page: NextPage<Props> = ({ user, event, rooms, sessions }) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>([]);

  const updateTeams = () => {
    apiFetch(`/api/events/${user.event}/teams`)
      .then(res => res?.json())
      .then(data => {
        setTeams(data);
      });
  };

  const { connectionStatus } = useWebsocket(event._id.toString(), ['pit-admin'], updateTeams, [
    { name: 'teamRegistered', handler: updateTeams }
  ]);

  return (
    <RoleAuthorizer user={user} allowedRoles={['display']} onFail={() => router.back()}>
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - לו"ז שיפוט | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/event/${event._id}/display`}
        backDisabled={connectionStatus !== 'connecting'}
      >
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>התחלה</TableCell>
                <TableCell>סיום</TableCell>
                {rooms.map(room => (
                  <TableCell key={room._id.toString()} align="center">
                    {`חדר ${room.name}`}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...new Set(sessions.flatMap(s => s.number))].map(row => {
                const startTime = dayjs(sessions.find(s => s.number === row)?.time);

                return (
                  <TableRow key={row}>
                    <TableCell>{startTime.format('HH:mm')}</TableCell>
                    <TableCell>
                      {startTime.add(JUDGING_SESSION_LENGTH, 'seconds').format('HH:mm')}
                    </TableCell>
                    {rooms.map(r => {
                      const team = teams.find(
                        t =>
                          t._id === sessions.find(s => s.number === row && s.room === r._id)?.team
                      );

                      return (
                        <TableCell key={r._id.toString()}>
                          <Typography
                            color={team?.registered ? '#fff' : 'error'}
                          >{`#${team?.number}`}</Typography>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
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

    const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );

    const roomsPromise = apiFetch(`/api/events/${user.event}/rooms`, undefined, ctx).then(res =>
      res?.json()
    );

    const sessionsPromise = apiFetch(`/api/events/${user.event}/sessions`, undefined, ctx).then(
      res => res?.json()
    );

    const [rooms, sessions, event] = await Promise.all([
      roomsPromise,
      sessionsPromise,
      eventPromise
    ]);

    return { props: { user, event, rooms, sessions } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
