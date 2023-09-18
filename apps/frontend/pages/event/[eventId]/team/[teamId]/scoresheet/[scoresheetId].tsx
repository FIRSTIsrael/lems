import { useState } from 'react';
import { ObjectId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Button, Paper, Stack, Typography, Box } from '@mui/material';
import { purple } from '@mui/material/colors';
import NextLink from 'next/link';
import {
  Event,
  JudgingCategory,
  JudgingRoom,
  JudgingSession,
  SafeUser,
  Rubric,
  Team
} from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import Layout from '../../../../../../components/layout';
import { RoleAuthorizer } from '../../../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../../../components/connection-indicator';
import { apiFetch } from '../../../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../../../hooks/use-websocket';
import { localizeTeam } from '../../../../../../localization/teams';

interface ScoresheetSelectorProps {
  event: WithId<Event>;
  team: WithId<Team>;
}

const ScoresheetSelector: React.FC<ScoresheetSelectorProps> = ({ event, team }) => {
  // this will make a button for each round appear for head refs
  return (
    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
      {[1, 2, 3, 4].map(match => (
        <NextLink
          key={match}
          href={`/event/${event._id}/team/${team._id}/rubrics/${match}`}
          passHref
        >
          <Button
            variant="contained"
            color="inherit"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: 1 === match ? purple[700] : 'transparent',
              color: 1 === match ? '#fff' : purple[700],
              borderRadius: '2rem',
              '&:hover': {
                backgroundColor: 1 === match ? purple[700] : purple[700] + '1f'
              }
            }}
          >
            Some round
          </Button>
        </NextLink>
      ))}
    </Stack>
  );
};

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  room: WithId<JudgingRoom>;
  team: WithId<Team>;
  session: WithId<JudgingSession>;
}

const Page: NextPage<Props> = ({ user, event, room, team, session }) => {
  const router = useRouter();
  if (!team.registered) router.back();
  if (session.status !== 'completed') router.back();

  const judgingCategory: string =
    typeof router.query.judgingCategory === 'string' ? router.query.judgingCategory : '';
  const [rubric, setRubric] = useState<WithId<Rubric<JudgingCategory>> | undefined>(undefined);

  const updateRubric = () => {
    apiFetch(`/api/events/${user.event}/teams/${router.query.teamId}/rubrics/${judgingCategory}`)
      .then(res => res?.json())
      .then(data => setRubric(data));
  };

  const { socket, connectionStatus } = useWebsocket(event._id.toString(), ['field'], updateRubric, [
    {
      name: 'rubricUpdated',
      handler: (teamId, rubricId) => {
        if (teamId === router.query.teamId) updateRubric();
      }
    }
  ]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['judge', 'judge-advisor']}
      conditionalRoles={'lead-judge'}
      conditions={{ roleAssociation: { type: 'category', value: judgingCategory } }}
      onFail={() => router.back()}
    >
      {team && rubric && (
        <Layout
          maxWidth="md"
          title={`מחוון ${
            localizedJudgingCategory[judgingCategory as JudgingCategory].name
          } של קבוצה #${team.number}, ${team.name} | ${event.name}`}
          error={connectionStatus === 'disconnected'}
          action={<ConnectionIndicator status={connectionStatus} />}
          back={`/event/${event._id}/${user.role}`}
          backDisabled={connectionStatus !== 'connecting'}
        >
          <Paper sx={{ p: 3, mt: 4, mb: 2 }}>
            <Typography variant="h2" fontSize="1.25rem" fontWeight={500} align="center">
              {localizeTeam(team)} | חדר שיפוט {room.name}
            </Typography>
          </Paper>
          <RoleAuthorizer user={user} allowedRoles={['judge', 'judge-advisor']}>
            <ScoresheetSelector event={event} team={team} />
          </RoleAuthorizer>
          <Box my={4}>
            <Typography>Scoresheet form</Typography>
          </Box>
        </Layout>
      )}
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    let roomId;
    if (user.roleAssociation && user.roleAssociation.type === 'room') {
      roomId = user.roleAssociation.value;
    } else {
      const sessions = await apiFetch(`/api/events/${user.event}/sessions`, undefined, ctx).then(
        res => res?.json()
      );
      roomId = sessions.find(
        (session: JudgingSession) => session.team == new ObjectId(String(ctx.params?.teamId))
      ).room;
    }

    const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );

    const teamPromise = apiFetch(
      `/api/events/${user.event}/teams/${ctx.params?.teamId}`,
      undefined,
      ctx
    ).then(res => res?.json());

    const roomPromise = apiFetch(`/api/events/${user.event}/rooms/${roomId}`, undefined, ctx).then(
      res => res?.json()
    );

    const [room, team, event] = await Promise.all([roomPromise, teamPromise, eventPromise]);

    const session = await apiFetch(
      `/api/events/${user.event}/rooms/${roomId}/sessions`,
      undefined,
      ctx
    ).then(res =>
      res?.json().then(sessions => sessions.find((s: JudgingSession) => s.team == team._id))
    );

    return { props: { user, event, room, team, session } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
