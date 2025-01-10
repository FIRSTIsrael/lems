import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { Switch, FormControlLabel } from '@mui/material';
import {
  DivisionWithEvent,
  Team,
  JudgingRoom,
  SafeUser,
  JudgingSession,
  RoleTypes
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import ReportJudgingSchedule from '../../../components/judging/report-judging-schedule';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizeDivisionTitle } from '../../../localization/event';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  teams: Array<WithId<Team>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  teams: initialTeams,
  rooms,
  sessions: initialSessions
}) => {
  const router = useRouter();
  const [showGeneralSchedule, setShowGeneralSchedule] = useState<boolean>(true);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id == team._id) {
          return team;
        } else {
          return t;
        }
      })
    );
  };

  const handleSessionEvent = (session: WithId<JudgingSession>) => {
    setSessions(sessions =>
      sessions.map(s => {
        if (s._id === session._id) {
          return session;
        }
        return s;
      })
    );
  };

  const { connectionStatus } = useWebsocket(
    division._id.toString(),
    ['pit-admin', 'judging'],
    undefined,
    [
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'judgingSessionUpdated', handler: handleSessionEvent }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - לו״ז שיפוט | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        user={user}
        division={division}
        back={`/lems/reports`}
        backDisabled={connectionStatus === 'connecting'}
        color={division.color}
      >
        <ReportJudgingSchedule
          division={division}
          sessions={sessions}
          teams={teams}
          rooms={rooms}
          showGeneralSchedule={showGeneralSchedule}
        />
        <FormControlLabel
          sx={{ mt: 2 }}
          control={
            <Switch
              checked={showGeneralSchedule}
              onChange={division => {
                setShowGeneralSchedule(division.target.checked);
              }}
            />
          }
          label="הצג אירועים כלליים"
        />
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withSchedule=true&withEvent=true`,
        teams: `/api/divisions/${divisionId}/teams`,
        rooms: `/api/divisions/${divisionId}/rooms`,
        sessions: `/api/divisions/${divisionId}/sessions`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
