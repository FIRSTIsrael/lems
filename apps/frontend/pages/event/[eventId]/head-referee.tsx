import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Event,
  SafeUser,
  Scoresheet,
  RobotGameMatch,
  RobotGameTable,
  EventState
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import WelcomeHeader from '../../../components/general/welcome-header';
import { apiFetch } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import MatchRow from '../../../components/field/match-row';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  tables: Array<WithId<RobotGameTable>>;
}

const Page: NextPage<Props> = ({ user, event, tables }) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<EventState | undefined>(undefined);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>> | undefined>(undefined);
  const [scoresheets, setScoresheets] = useState<Array<WithId<Scoresheet>> | undefined>(undefined);

  const getEventState = () => {
    apiFetch(`/api/events/${user.event}/state/`)
      .then(res => res.json())
      .then(data => {
        setEventState(data);
      });
  };

  const getMatches = () => {
    apiFetch(`/api/events/${user.event}/matches`)
      .then(res => res.json())
      .then(data => setMatches(data));
  };

  const getScoresheets = () => {
    apiFetch(`/api/events/${user.event}/scoresheets/`)
      .then(res => res.json())
      .then(data => {
        setScoresheets(data);
      });
  };

  const getInitialData = () => {
    getEventState();
    getMatches();
    getScoresheets();
  };

  const getData = () => {
    getEventState();
    getMatches();
  };

  const { connectionStatus } = useWebsocket(event._id.toString(), ['field'], getInitialData, [
    { name: 'matchStarted', handler: getData },
    { name: 'matchCompleted', handler: getData },
    { name: 'matchAborted', handler: getData },
    { name: 'matchUpdated', handler: getData },
    { name: 'matchParticipantPrestarted', handler: getData },
    { name: 'scoresheetStatusChanged', handler: getScoresheets }
  ]);

  return (
    <RoleAuthorizer user={user} allowedRoles="head-referee" onFail={() => router.back()}>
      <Layout
        maxWidth="lg"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        <WelcomeHeader event={event} user={user} />
        {eventState && (
          <TableContainer component={Paper} sx={{ my: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  {tables.map(room => (
                    <TableCell key={room._id.toString()} align="center">
                      {room.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {matches &&
                  scoresheets &&
                  matches.map(match => (
                    <MatchRow
                      key={match._id.toString()}
                      event={event}
                      match={match}
                      tables={tables}
                      scoresheets={scoresheets.filter(s => s.matchId === match._id)}
                      eventState={eventState}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
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
    const tablesPromise = apiFetch(`/api/events/${user.event}/tables/`, undefined, ctx).then(res =>
      res?.json()
    );

    const [tables, event] = await Promise.all([tablesPromise, eventPromise]);

    return { props: { user, event, tables } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
