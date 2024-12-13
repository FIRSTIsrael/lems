import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import {
  DivisionState,
  Team,
  JudgingRoom,
  JudgingSession,
  SafeUser,
  Rubric,
  JudgingCategory,
  JudgingDeliberation,
  DivisionWithEvent
} from '@lems/types';
import { RoleAuthorizer } from '../../components/role-authorizer';
import RubricStatusReferences from '../../components/judging/rubric-status-references';
import JudgingRoomSchedule from '../../components/judging/judging-room-schedule';
import Layout from '../../components/layout';
import WelcomeHeader from '../../components/general/welcome-header';
import { getUserAndDivision, serverSideGetRequests } from '../../lib/utils/fetch';
import { localizedRoles } from '../../localization/roles';
import { useWebsocket } from '../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';
import CategoryDeliberationHeader from '../../components/judging/category-deliberation-header';
import { localizeDivisionTitle } from '../../localization/event';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  divisionState: WithId<DivisionState>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  deliberation: WithId<JudgingDeliberation>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState,
  rooms,
  teams: initialTeams,
  sessions: initialSessions,
  rubrics: initialRubrics,
  deliberation: initialDeliberation
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);
  const [rubrics, setRubrics] = useState<Array<WithId<Rubric<JudgingCategory>>>>(initialRubrics);
  const [deliberation, setDeliberation] =
    useState<WithId<JudgingDeliberation>>(initialDeliberation);

  const updateDeliberation = (newDeliberation: WithId<JudgingDeliberation>) => {
    if (deliberation._id === newDeliberation._id) {
      setDeliberation(newDeliberation);
    }
  };

  const handleSessionEvent = (
    session: WithId<JudgingSession>,
    divisionState?: WithId<DivisionState>
  ) => {
    setSessions(sessions =>
      sessions.map(s => {
        if (s._id === session._id) {
          return session;
        }
        return s;
      })
    );
  };

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

  const updateRubric = (rubric: WithId<Rubric<JudgingCategory>>) => {
    setRubrics(rubrics =>
      rubrics.map(r => {
        if (r._id === rubric._id) {
          return rubric;
        }
        return r;
      })
    );
  };

  const handleLeadJudgeCalled = (room: JudgingRoom) => {
    enqueueSnackbar(`חדר ${room.name} צריך עזרה!`, {
      variant: 'warning',
      persist: true
    });
  };

  const { socket, connectionStatus } = useWebsocket(
    division._id.toString(),
    ['judging', 'pit-admin'],
    undefined,
    [
      { name: 'judgingSessionStarted', handler: handleSessionEvent },
      { name: 'judgingSessionCompleted', handler: handleSessionEvent },
      { name: 'judgingSessionAborted', handler: handleSessionEvent },
      { name: 'judgingSessionUpdated', handler: handleSessionEvent },
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'rubricStatusChanged', handler: updateRubric },
      { name: 'leadJudgeCalled', handler: handleLeadJudgeCalled },
      { name: 'judgingDeliberationStatusChanged', handler: updateDeliberation }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="lead-judge"
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        user={user}
        division={division}
        divisionState={divisionState}
        color={division.color}
      >
        <>
          <WelcomeHeader division={division} user={user} />
          <CategoryDeliberationHeader
            division={division}
            deliberation={deliberation}
            sessions={sessions}
          />
          <Paper sx={{ borderRadius: 2, mb: 4, boxShadow: 2, p: 2 }}>
            <RubricStatusReferences />
          </Paper>
          {rooms.map(room => (
            <Paper key={room._id.toString()} sx={{ borderRadius: 3, mb: 4, boxShadow: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  p: 3,
                  pb: 1
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#ede9fe',
                    color: '#a78bfa',
                    width: '2rem',
                    height: '2rem',
                    mr: 1
                  }}
                >
                  <JudgingRoomIcon sx={{ fontSize: '1rem' }} />
                </Avatar>
                <Typography variant="h2" fontSize="1.25rem">
                  חדר שיפוט {room.name}
                </Typography>
              </Box>
              <JudgingRoomSchedule
                sessions={sessions.filter(s => s.roomId === room._id)}
                division={division}
                room={room}
                teams={teams}
                user={user}
                socket={socket}
                rubrics={rubrics}
              />
            </Paper>
          ))}
        </>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const { user, divisionId } = await getUserAndDivision(ctx);
    const category = user.roleAssociation?.value;
    if (!category) throw new Error('No category found for lead judge');

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withEvent=true`,
        divisionState: `/api/divisions/${divisionId}/state`,
        teams: `/api/divisions/${divisionId}/teams`,
        rooms: `/api/divisions/${divisionId}/rooms`,
        sessions: `/api/divisions/${divisionId}/sessions`,
        rubrics: `/api/divisions/${divisionId}/rubrics/${category}`,
        deliberation: `/api/divisions/${divisionId}/deliberations/category/${category}`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
