import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ObjectId, WithId } from 'mongodb';
import { Paper, Tabs, Tab } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { Event, SafeUser, RobotGameMatch, EventState } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizedRoles } from '../../../localization/roles';
import { enqueueSnackbar } from 'notistack';
import FieldControl from '../../../components/field/scorekeeper/field-control';
import VideoSwitch from '../../../components/field/scorekeeper/video-switch';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<EventState>(initialEventState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [nextMatchId, setNextMatchId] = useState<ObjectId | undefined>(
    matches?.find(match => match.status === 'not-started' && match.stage !== 'test')?._id
  );
  const [activeTab, setActiveTab] = useState<string>('1');

  const handleMatchEvent = (match: WithId<RobotGameMatch>, newEventState?: WithId<EventState>) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === match._id) {
          return match;
        }
        return m;
      })
    );

    if (newEventState) setEventState(newEventState);
  };

  const handleMatchStarted = (
    newMatch: WithId<RobotGameMatch>,
    newEventState: WithId<EventState>
  ) => {
    handleMatchEvent(newMatch, newEventState);
    const newNextMatchId = matches?.find(
      match => match.status === 'not-started' && match._id != newMatch._id
    )?._id;
    if (newEventState.loadedMatch === null && newMatch.stage !== 'test') {
      setNextMatchId(newNextMatchId);
      if (newNextMatchId)
        socket.emit('loadMatch', event._id.toString(), newNextMatchId.toString(), response => {
          if (!response.ok) {
            enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
          }
        });
    }
  };

  const handleMatchAborted = (
    newMatch: WithId<RobotGameMatch>,
    newEventState: WithId<EventState>
  ) => {
    handleMatchEvent(newMatch, newEventState);
    if (newMatch.stage !== 'test') {
      setNextMatchId(newMatch._id);
      socket.emit('loadMatch', event._id.toString(), newMatch._id.toString(), response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
        }
      });
    }
  };

  const { socket, connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, [
    { name: 'matchLoaded', handler: handleMatchEvent },
    { name: 'matchStarted', handler: handleMatchStarted },
    { name: 'matchAborted', handler: handleMatchAborted },
    { name: 'matchCompleted', handler: handleMatchEvent },
    { name: 'matchUpdated', handler: handleMatchEvent },
    { name: 'audienceDisplayStateUpdated', handler: setEventState }
  ]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="scorekeeper"
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        <TabContext value={activeTab}>
          <Paper sx={{ mt: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue: string) => setActiveTab(newValue)}
              centered
            >
              <Tab label="מגרש" value="1" />
              <Tab label="תצוגת קהל" value="2" />
            </Tabs>
          </Paper>
          <TabPanel value="1">
            <FieldControl
              event={event}
              eventState={eventState}
              matches={matches}
              nextMatchId={nextMatchId || null}
              socket={socket}
            />
          </TabPanel>
          <TabPanel value="2">
            <VideoSwitch eventState={eventState} socket={socket} />
          </TabPanel>
        </TabContext>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.eventId}`,
        eventState: `/api/events/${user.eventId}/state`,
        matches: `/api/events/${user.eventId}/matches`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
