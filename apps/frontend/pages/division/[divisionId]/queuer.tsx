import { useState } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import DivisionNoteRoundedIcon from '@mui/icons-material/DivisionNoteRounded';
import {
  Division,
  DivisionState,
  SafeUser,
  Team,
  RobotGameMatch,
  RobotGameTable,
  JudgingSession,
  JudgingRoom
} from '@lems/types';
import { useWebsocket } from '../../../hooks/use-websocket';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import QueuerFieldTeamDisplay from '../../../components/queueing/queuer-field-team-display';
import QueuerFieldSchedule from '../../../components/queueing/queuer-field-schedule';
import QueuerPitMap from '../../../components/queueing/queuer-pit-map';
import QueuerJudgingSchedule from '../../../components/queueing/queuer-judging-schedule';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles, localizedDivisionSection } from '../../../localization/roles';
import QueuerJudgingTeamDisplay from '../../../components/queueing/queuer-judging-team-display';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  divisionState: WithId<DivisionState>;
  teams: Array<WithId<Team>>;
  tables: Array<WithId<RobotGameTable>>;
  rooms: Array<WithId<JudgingRoom>>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  pitMapUrl: string;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState: initialDivisionState,
  teams: initialTeams,
  tables,
  rooms,
  matches: initialMatches,
  sessions: initialSessions,
  pitMapUrl
}) => {
  const NAVIGATION_HEIGHT = 60;
  const NAVIGATION_PADDING = 10;
  const router = useRouter();
  const [activeView, setActiveView] = useState(0);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);

  const handleMatchDivision = (
    match: WithId<RobotGameMatch>,
    newDivisionState?: WithId<DivisionState>
  ) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === match._id) {
          return match;
        }
        return m;
      })
    );

    if (newDivisionState) setDivisionState(newDivisionState);
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

  const handleSessionDivision = (
    session: WithId<JudgingSession>,
    newDivisionState?: WithId<DivisionState>
  ) => {
    setSessions(sessions =>
      sessions.map(s => {
        if (s._id === session._id) {
          return session;
        }
        return s;
      })
    );

    if (newDivisionState) setDivisionState(newDivisionState);
  };

  useWebsocket(division._id.toString(), ['field', 'pit-admin', 'judging'], undefined, [
    { name: 'matchLoaded', handler: handleMatchDivision },
    { name: 'matchStarted', handler: handleMatchDivision },
    { name: 'matchCompleted', handler: handleMatchDivision },
    { name: 'matchUpdated', handler: handleMatchDivision },
    { name: 'teamRegistered', handler: handleTeamRegistered },
    { name: 'judgingSessionStarted', handler: handleSessionDivision },
    { name: 'judgingSessionCompleted', handler: handleSessionDivision },
    { name: 'judgingSessionAborted', handler: handleSessionDivision },
    { name: 'judgingSessionUpdated', handler: handleSessionDivision }
  ]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['queuer']}
      onFail={() => {
        router.push(`/division/${division._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | מתחם ${localizedDivisionSection[user.roleAssociation?.value as string].name}`}
        color={division.color}
      >
        <Box sx={{ overflowY: 'auto', pb: `${NAVIGATION_HEIGHT + NAVIGATION_PADDING}px` }}>
          {activeView === 0 && (
            <>
              {user.roleAssociation?.value === 'field' && (
                <QueuerFieldTeamDisplay
                  divisionState={divisionState}
                  teams={teams}
                  matches={matches}
                />
              )}
              {user.roleAssociation?.value === 'judging' && (
                <QueuerJudgingTeamDisplay teams={teams} sessions={sessions} rooms={rooms} />
              )}
            </>
          )}
          {activeView === 1 && <QueuerPitMap division={division} pitMapUrl={pitMapUrl} />}
          {activeView === 2 && (
            <>
              {user.roleAssociation?.value === 'field' && (
                <QueuerFieldSchedule
                  division={division}
                  matches={matches}
                  teams={teams}
                  tables={tables}
                />
              )}
              {user.roleAssociation?.value === 'judging' && (
                <QueuerJudgingSchedule
                  division={division}
                  rooms={rooms}
                  sessions={sessions}
                  teams={teams}
                />
              )}
            </>
          )}
        </Box>
        <BottomNavigation
          showLabels
          value={activeView}
          onChange={(division, newValue) => {
            setActiveView(newValue);
          }}
          sx={{ position: 'fixed', bottom: 0, right: 0, height: NAVIGATION_HEIGHT, width: '100vw' }}
        >
          <BottomNavigationAction label="בית" icon={<HomeRoundedIcon />} />
          <BottomNavigationAction label="מפת פיטים" icon={<MapRoundedIcon />} />
          <BottomNavigationAction label="לוח זמנים" icon={<DivisionNoteRoundedIcon />} />
        </BottomNavigation>
      </Layout>
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
        tables: `/api/divisions/${user.divisionId}/tables`,
        rooms: `/api/divisions/${user.divisionId}/rooms`,
        sessions: `/api/divisions/${user.divisionId}/sessions`,
        matches: `/api/divisions/${user.divisionId}/matches`
      },
      ctx
    );

    const pitMapUrl = `https://${process.env.DIGITALOCEAN_SPACE}.${process.env.DIGITALOCEAN_ENDPOINT}/pit-maps`;

    return { props: { user, pitMapUrl, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
