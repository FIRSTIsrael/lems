import { useState, useMemo, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { Paper, Tabs, Tab, Stack } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import {
  Event,
  SafeUser,
  RobotGameMatch,
  EventState,
  Team,
  MATCH_AUTOLOAD_THRESHOLD
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import ReportLink from '../../../components/general/report-link';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import { useTime } from '../../../hooks/use-time';
import { localizedRoles } from '../../../localization/roles';
import { enqueueSnackbar } from 'notistack';
import FieldControl from '../../../components/field/scorekeeper/field-control';
import VideoSwitch from '../../../components/field/scorekeeper/video-switch';
import PresentationController from '../../../components/field/scorekeeper/presentation-controller';
import AwardsPresentation from '../../../components/presentations/awards-presentation';
import MessageEditor from '../../../components/field/scorekeeper/message-editor';
import ScoreboardConfigurator from '../../../components/field/scorekeeper/scoreboard-configurator';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  teams: initialTeams,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [activeTab, setActiveTab] = useState<string>('1');

  const currentTime = useTime({ interval: 1000 });

  const nextMatch = useMemo<WithId<RobotGameMatch> | undefined>(
    () => matches?.find(match => match.status === 'not-started' && match.stage !== 'test'),
    [matches]
  );

  useEffect(() => {
    if (
      eventState.loadedMatch === null &&
      !matches.some(m => m.stage === 'test' && m.status === 'in-progress')
    ) {
      if (
        nextMatch?.stage === eventState.currentStage &&
        nextMatch?.scheduledTime &&
        dayjs(nextMatch.scheduledTime).isBefore(
          currentTime.add(MATCH_AUTOLOAD_THRESHOLD, 'minutes')
        )
      )
        socket.emit('loadMatch', event._id.toString(), nextMatch._id.toString(), response => {
          if (!response.ok) enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextMatch]);

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

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id == team._id) {
          return team;
        }
        return t;
      })
    );
  };

  const handleMatchAborted = (
    newMatch: WithId<RobotGameMatch>,
    newEventState: WithId<EventState>
  ) => {
    handleMatchEvent(newMatch, newEventState);
    if (newMatch.stage !== 'test') {
      socket.emit('loadMatch', event._id.toString(), newMatch._id.toString(), response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
        }
      });
    }
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['field', 'audience-display'],
    undefined,
    [
      { name: 'matchLoaded', handler: handleMatchEvent },
      { name: 'matchStarted', handler: handleMatchEvent },
      { name: 'matchAborted', handler: handleMatchAborted },
      { name: 'matchCompleted', handler: handleMatchEvent },
      { name: 'matchUpdated', handler: handleMatchEvent },
      { name: 'audienceDisplayUpdated', handler: setEventState },
      { name: 'presentationUpdated', handler: setEventState },
      { name: 'teamRegistered', handler: handleTeamRegistered }
    ]
  );

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
        action={
          <Stack direction="row" spacing={2}>
            <ConnectionIndicator status={connectionStatus} />
            <ReportLink event={event} />
          </Stack>
        }
        color={event.color}
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
              nextMatchId={nextMatch?._id}
              socket={socket}
            />
          </TabPanel>
          <TabPanel value="2">
            <Stack alignItems="center">
              <VideoSwitch eventState={eventState} socket={socket} />
              {eventState.audienceDisplay.screen === 'awards' &&
                eventState.presentations['awards'].enabled && (
                  <PresentationController
                    event={event}
                    socket={socket}
                    presentationId="awards"
                    eventState={eventState}
                  >
                    <AwardsPresentation
                      event={event}
                      height={108 * 2.5}
                      width={192 * 2.5}
                      position="relative"
                    />
                  </PresentationController>
                )}
              {eventState.audienceDisplay.screen === 'message' && (
                <MessageEditor eventState={eventState} socket={socket} />
              )}
              {eventState.audienceDisplay.screen === 'scores' && (
                <ScoreboardConfigurator eventState={eventState} socket={socket} />
              )}
            </Stack>
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
        teams: `/api/events/${user.eventId}/teams`,
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
