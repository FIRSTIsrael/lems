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
  scoresheets: Array<WithId<Scoresheet>>;
  eventState: WithId<EventState>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  tables,
  eventState: initialEventState,
  matches: initialMatches,
  scoresheets: initialScoresheets
}) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<EventState>(initialEventState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [scoresheets, setScoresheets] = useState<Array<WithId<Scoresheet>>>(initialScoresheets);

  const updateMatches = (newMatch: WithId<RobotGameMatch>) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === newMatch._id) {
          return newMatch;
        }
        return m;
      })
    );
  };

  const handleMatchEvent = (
    newMatch: WithId<RobotGameMatch>,
    newEventState: WithId<EventState>
  ) => {
    setEventState(newEventState);
    updateMatches(newMatch);
  };

  const updateScoresheet = (scoresheet: WithId<Scoresheet>) => {
    setScoresheets(scoresheets =>
      scoresheets.map(s => {
        if (s._id === scoresheet._id) {
          return scoresheet;
        }
        return s;
      })
    );
  };

  const { connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, [
    { name: 'matchStarted', handler: handleMatchEvent },
    { name: 'matchCompleted', handler: handleMatchEvent },
    { name: 'matchAborted', handler: handleMatchEvent },
    { name: 'matchUpdated', handler: handleMatchEvent },
    { name: 'matchParticipantPrestarted', handler: handleMatchEvent },
    { name: 'scoresheetStatusChanged', handler: updateScoresheet }
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
    const tablesPromise = apiFetch(`/api/events/${user.event}/tables`, undefined, ctx).then(res =>
      res?.json()
    );

    const scoresheetsPromise = apiFetch(
      `/api/events/${user.event}/scoresheets`,
      undefined,
      ctx
    ).then(res => res.json());

    const eventStatePromise = apiFetch(`/api/events/${user.event}/state`, undefined, ctx).then(
      res => res?.json()
    );
    const matchesPromise = apiFetch(`/api/events/${user.event}/matches`, undefined, ctx).then(res =>
      res.json()
    );

    const [tables, event, scoresheets, eventState, matches] = await Promise.all([
      tablesPromise,
      eventPromise,
      scoresheetsPromise,
      eventStatePromise,
      matchesPromise
    ]);

    return { props: { user, event, tables, scoresheets, eventState, matches } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
