import { useMemo, useRef, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import {
  Division,
  Team,
  SafeUser,
  RoleTypes,
  DivisionState,
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
  division: WithId<Division>;
  divisionState: WithId<DivisionState>;
  matches: Array<WithId<RobotGameMatch>>;
  scoresheets: Array<WithId<Scoresheet>>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  teams: initialTeams,
  divisionState: initialDivisionState,
  matches: initialMatches,
  scoresheets: initialScoresheets
}) => {
  const router = useRouter();
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [scorehseets, setScoresheets] = useState<Array<WithId<Scoresheet>>>(initialScoresheets);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);

  const sounds = useRef({
    start: new Audio('/assets/sounds/field/field-start.wav'),
    abort: new Audio('/assets/sounds/field/field-abort.wav'),
    endgame: new Audio('/assets/sounds/field/field-endgame.wav'),
    end: new Audio('/assets/sounds/field/field-end.wav')
  });

  const activeMatch = useMemo(
    () => matches.find(m => m._id === divisionState.activeMatch),
    [matches, divisionState]
  );

  const loadedMatch = useMemo(
    () => matches.find(m => m._id === divisionState.loadedMatch),
    [matches, divisionState]
  );

  const previousMatch = useMemo(
    () =>
      matches
        .slice()
        .reverse()
        .find(m => m.status === 'completed' && m.stage === divisionState.currentStage),
    [matches, divisionState.currentStage]
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

  const handleMatchDivision = (
    newMatch: WithId<RobotGameMatch>,
    newDivisionState?: WithId<DivisionState>
  ) => {
    updateMatches(newMatch);
    if (newDivisionState) setDivisionState(newDivisionState);
  };

  const handleScoresheetDivision = (scoresheet: WithId<Scoresheet>) => {
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

  useWebsocket(division._id.toString(), ['pit-admin', 'field', 'audience-display'], undefined, [
    {
      name: 'matchStarted',
      handler: (newMatch, newDivisionState) => {
        if (divisionState.audienceDisplay.screen === 'scores') sounds.current.start.play();
        handleMatchDivision(newMatch, newDivisionState);
      }
    },
    {
      name: 'matchAborted',
      handler: (newMatch, newDivisionState) => {
        if (divisionState.audienceDisplay.screen === 'scores') sounds.current.abort.play();
        handleMatchDivision(newMatch, newDivisionState);
      }
    },
    {
      name: 'matchEndgame',
      handler: () => {
        if (divisionState.audienceDisplay.screen === 'scores') sounds.current.endgame.play();
      }
    },
    {
      name: 'matchCompleted',
      handler: (newMatch, newDivisionState) => {
        if (divisionState.audienceDisplay.screen === 'scores') sounds.current.end.play();
        handleMatchDivision(newMatch, newDivisionState);
      }
    },
    { name: 'matchLoaded', handler: handleMatchDivision },
    { name: 'matchUpdated', handler: handleMatchDivision },
    { name: 'scoresheetUpdated', handler: handleScoresheetDivision },
    { name: 'audienceDisplayUpdated', handler: setDivisionState },
    { name: 'presentationUpdated', handler: setDivisionState },
    { name: 'teamRegistered', handler: handleTeamRegistered }
  ]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/division/${division._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <AudienceDisplayContainer>
        {divisionState.audienceDisplay.screen === 'blank' && <Blank />}
        {divisionState.audienceDisplay.screen === 'logo' && <FIRSTLogo />}
        {divisionState.audienceDisplay.screen === 'hotspot' && <HotspotReminder />}
        {divisionState.audienceDisplay.screen === 'sponsors' && <Sponsors />}
        {divisionState.audienceDisplay.screen === 'match-preview' && (
          <MatchPreview division={division} match={loadedMatch} />
        )}
        {divisionState.audienceDisplay.screen === 'scores' && (
          <Scoreboard
            activeMatch={activeMatch}
            previousMatch={previousMatch}
            scoresheets={scorehseets}
            teams={teams}
            divisionState={divisionState}
          />
        )}
        {divisionState.audienceDisplay.screen === 'awards' && (
          <AwardsPresentation
            initialState={divisionState.presentations['awards'].activeView}
            enableReinitialize={true}
            height="100%"
            width="100%"
            division={division}
          />
        )}
        {divisionState.audienceDisplay.screen === 'message' && (
          <Message message={divisionState.audienceDisplay.message} />
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
        division: `/api/divisions/${user.divisionId}`,
        teams: `/api/divisions/${user.divisionId}/teams`,
        divisionState: `/api/divisions/${user.divisionId}/state`,
        matches: `/api/divisions/${user.divisionId}/matches`,
        scoresheets: `/api/divisions/${user.divisionId}/scoresheets`
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
