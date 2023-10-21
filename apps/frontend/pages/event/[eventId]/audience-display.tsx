import { useMemo, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import {
  Event,
  Team,
  SafeUser,
  RoleTypes,
  EventState,
  RobotGameMatch,
  Scoresheet
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import FIRSTLogo from '../../../components/audience-display/first-logo';
import HotspotReminder from '../../../components/audience-display/hotspot-reminder';
import Sponsors from '../../../components/audience-display/sponsors';
import Scoreboard from '../../../components/audience-display/scoreboard/scoreboard';
import MatchPreview from '../../../components/audience-display/match-preview';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  matches: Array<WithId<RobotGameMatch>>;
  scoresheets: Array<WithId<Scoresheet>>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  teams,
  eventState: initialEventState,
  matches: initialMatches,
  scoresheets: initialScoresheets
}) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [scorehseets, setScoresheets] = useState<Array<WithId<Scoresheet>>>(initialScoresheets);

  const activeMatch = useMemo(
    () => matches.find(m => m._id === eventState.activeMatch),
    [matches, eventState]
  );

  const loadedMatch = useMemo(
    () => matches.find(m => m._id === eventState.loadedMatch),
    [matches, eventState]
  );

  const previousMatch = useMemo(
    () =>
      matches
        .slice()
        .reverse()
        .find(m => m.status === 'completed' && m.stage !== 'test'),
    [matches]
  );

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
    newEventState?: WithId<EventState>
  ) => {
    updateMatches(newMatch);
    if (newEventState) setEventState(newEventState);
  };

  const handleScoresheetEvent = (scoresheet: WithId<Scoresheet>) => {
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
    {
      name: 'matchStarted',
      handler: (newMatch, newEventState) => {
        handleMatchEvent(newMatch, newEventState);
        if (eventState.audienceDisplayState === 'scores')
          new Audio('/assets/sounds/field/field-start.wav').play();
      }
    },
    {
      name: 'matchAborted',
      handler: (newMatch, newEventState) => {
        handleMatchEvent(newMatch, newEventState);
        if (eventState.audienceDisplayState === 'scores')
          new Audio('/assets/sounds/field/field-abort.wav').play();
      }
    },
    {
      name: 'matchCompleted',
      handler: (newMatch, newEventState) => {
        handleMatchEvent(newMatch, newEventState);
        if (eventState.audienceDisplayState === 'scores')
          new Audio('/assets/sounds/field/field-end.wav').play();
      }
    },
    { name: 'matchLoaded', handler: handleMatchEvent },
    { name: 'matchUpdated', handler: handleMatchEvent },
    { name: 'scoresheetUpdated', handler: handleScoresheetEvent },
    { name: 'audienceDisplayStateUpdated', handler: setEventState }
  ]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout maxWidth="xl" error={connectionStatus === 'disconnected'}>
        {eventState.audienceDisplayState === 'logo' && <FIRSTLogo />}
        {eventState.audienceDisplayState === 'hotspot' && <HotspotReminder />}
        {eventState.audienceDisplayState === 'sponsors' && <Sponsors />}
        {eventState.audienceDisplayState === 'match-preview' && (
          <MatchPreview event={event} match={loadedMatch} />
        )}
        {eventState.audienceDisplayState === 'scores' && (
          <Scoreboard
            activeMatch={activeMatch}
            previousMatch={previousMatch}
            scoresheets={scorehseets}
            teams={teams}
            eventState={eventState}
          />
        )}
        {/* {eventState.audienceDisplayState === 'awards' && <Presentation />} */}
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
        matches: `/api/events/${user.eventId}/matches`,
        scoresheets: `/api/events/${user.eventId}/scoresheets`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
