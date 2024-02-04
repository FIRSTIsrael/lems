import { useMemo, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
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
import Blank from '../../../components/audience-display/blank';
import HotspotReminder from '../../../components/audience-display/hotspot-reminder';
import Sponsors from '../../../components/audience-display/sponsors';
import Scoreboard from '../../../components/audience-display/scoreboard/scoreboard';
import MatchPreview from '../../../components/audience-display/match-preview';
import Message from '../../..//components/audience-display/message';
import AwardsPresentation from '../../../components/presentations/awards-presentation';
import FIRSTLogo from '../../../components/audience-display/first-logo';
import AudienceDisplayContainer from '../../../components/audience-display/audience-display-container';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import useKeyboardShortcut from '../../../hooks/use-keyboard-shortcut';
import { useWebsocket } from '../../../hooks/use-websocket';

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
  teams: initialTeams,
  eventState: initialEventState,
  matches: initialMatches,
  scoresheets: initialScoresheets
}) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [scorehseets, setScoresheets] = useState<Array<WithId<Scoresheet>>>(initialScoresheets);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);

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
        .find(m => m.status === 'completed' && m.stage === eventState.currentStage),
    [matches, eventState.currentStage]
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

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id === team._id) {
          return team;
        }
        return t;
      })
    );
  };

  console.log('Ctrl + Shift + L to logout.');
  useKeyboardShortcut(
    () => apiFetch('/auth/logout', { method: 'POST' }).then(() => router.push('/')),
    { code: 'KeyL', ctrlKey: true, shiftKey: true }
  );

  useWebsocket(event._id.toString(), ['pit-admin', 'field', 'audience-display'], undefined, [
    {
      name: 'matchStarted',
      handler: (newMatch, newEventState) => {
        if (eventState.audienceDisplay.screen === 'scores')
          new Audio('/assets/sounds/field/field-start.wav').play();
        handleMatchEvent(newMatch, newEventState);
      }
    },
    {
      name: 'matchAborted',
      handler: (newMatch, newEventState) => {
        if (eventState.audienceDisplay.screen === 'scores')
          new Audio('/assets/sounds/field/field-abort.wav').play();
        handleMatchEvent(newMatch, newEventState);
      }
    },
    {
      name: 'matchEndgame',
      handler: () => {
        if (eventState.audienceDisplay.screen === 'scores')
          new Audio('/assets/sounds/field/field-endgame.wav').play();
      }
    },
    {
      name: 'matchCompleted',
      handler: (newMatch, newEventState) => {
        if (eventState.audienceDisplay.screen === 'scores')
          new Audio('/assets/sounds/field/field-end.wav').play();
        handleMatchEvent(newMatch, newEventState);
      }
    },
    { name: 'matchLoaded', handler: handleMatchEvent },
    { name: 'matchUpdated', handler: handleMatchEvent },
    { name: 'scoresheetUpdated', handler: handleScoresheetEvent },
    { name: 'audienceDisplayUpdated', handler: setEventState },
    { name: 'presentationUpdated', handler: setEventState },
    { name: 'teamRegistered', handler: handleTeamRegistered }
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
      <AudienceDisplayContainer>
        {eventState.audienceDisplay.screen === 'blank' && <Blank />}
        {eventState.audienceDisplay.screen === 'logo' && <FIRSTLogo />}
        {eventState.audienceDisplay.screen === 'hotspot' && <HotspotReminder />}
        {eventState.audienceDisplay.screen === 'sponsors' && <Sponsors />}
        {eventState.audienceDisplay.screen === 'match-preview' && (
          <MatchPreview event={event} match={loadedMatch} />
        )}
        {eventState.audienceDisplay.screen === 'scores' && (
          <Scoreboard
            activeMatch={activeMatch}
            previousMatch={previousMatch}
            scoresheets={scorehseets}
            teams={teams}
            eventState={eventState}
          />
        )}
        {eventState.audienceDisplay.screen === 'awards' && (
          <AwardsPresentation
            initialState={eventState.presentations['awards'].activeView}
            enableReinitialize={true}
            height="100%"
            width="100%"
            event={event}
            teams={teams}
          />
        )}
        {eventState.audienceDisplay.screen === 'message' && (
          <Message message={eventState.audienceDisplay.message} />
        )}
      </AudienceDisplayContainer>
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
