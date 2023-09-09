import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import { Event, Team, JudgingRoom, JudgingSession, SafeUser } from '@lems/types';
import { ensureArray } from '@lems/utils';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { apiFetch } from '../../../lib/utils/fetch';
import Layout from '../../../components/layout';
import WelcomeHeader from '../../../components/display/welcome-header';
import { localizeRole } from '../../../lib/utils/localization';
import RubricStatusReferences from '../../../components/display/judging/rubric-status-references';
import JudgingRoomSchedule from '../../../components/display/judging/judging-room-schedule';

interface Props {
  user: SafeUser;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  room: WithId<JudgingRoom>;
  sessions: Array<WithId<JudgingSession>>;
}

const Page: NextPage<Props> = ({ user, event, teams, room, sessions }) => {
  const router = useRouter();
  const [isJudging, setIsJudging] = useState<boolean>(false);

  return (
    <RoleAuthorizer user={user} allowedRoles="judge" onFail={() => router.back()}>
      <Layout
        maxWidth={700}
        title={`ממשק ${user.role && localizeRole(user.role).name} | ${event.name}`}
      >
        {isJudging ? (
          <Typography>Hello im timer</Typography>
        ) : (
          <>
            <WelcomeHeader event={event} user={user} />
            <Paper sx={{ borderRadius: 2, mb: 4, boxShadow: 2, p: 2 }}>
              <RubricStatusReferences />
            </Paper>
            <Paper sx={{ borderRadius: 3, mb: 4, boxShadow: 2 }}>
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
                sessions={sessions}
                rooms={ensureArray(room)}
                teams={teams}
                user={user}
              />
            </Paper>
          </>
        )}
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

  const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
    res?.json()
  );
  const teamsPromise = apiFetch(`/api/events/${user.event}/teams`, undefined, ctx).then(res =>
    res?.json()
  );
  const roomPromise = apiFetch(
    `/api/events/${user.event}/rooms/${user.roleAssociation.value}`,
    undefined,
    ctx
  ).then(res => res?.json());
  const [teams, room, event] = await Promise.all([teamsPromise, roomPromise, eventPromise]);

  const sessions = await apiFetch(
    `/api/events/${user.event}/rooms/${room._id}/sessions`,
    undefined,
    ctx
  ).then(res => res?.json());

  return { props: { user, event, teams, room, sessions } };
};

export default Page;
