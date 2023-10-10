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
import Scoreboard from '../../../components/audience-display/scoreboard';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';

type AudienceDisplayState = 'scores' | 'awards' | 'sponsors' | 'logo' | 'hotspot';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  matches: Array<WithId<RobotGameMatch>>;
  scoresheets: Array<WithId<Scoresheet>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  matches: initialMatches,
  scoresheets: initialScoresheets
}) => {
  const router = useRouter();
  const [state, setState] = useState<AudienceDisplayState>('scores');
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [scorehseets, setScoresheets] = useState<Array<WithId<Scoresheet>>>(initialScoresheets);

  const activeMatch = useMemo(
    () => matches.find(m => m._id === eventState.activeMatch),
    [matches, eventState]
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
    newEventState: WithId<EventState>
  ) => {
    setEventState(newEventState);
    updateMatches(newMatch);
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
    { name: 'matchStarted', handler: handleMatchEvent },
    { name: 'matchAborted', handler: handleMatchEvent },
    { name: 'matchCompleted', handler: handleMatchEvent },
    { name: 'scoresheetUpdated', handler: handleScoresheetEvent }
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
        {state === 'logo' && <FIRSTLogo />}
        {state === 'hotspot' && <HotspotReminder />}
        {state === 'sponsors' && <Sponsors />}
        {state === 'scores' && (
          <Scoreboard
            activeMatch={activeMatch || ({} as WithId<RobotGameMatch>)}
            scoresheets={scorehseets}
            eventState={eventState}
          />
        )}
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.event}`,
        teams: `/api/events/${user.event}/teams`,
        eventState: `/api/events/${user.event}/state`,
        matches: `/api/events/${user.event}/matches`,
        scoresheets: `/api/events/${user.event}/scorehseets`
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
