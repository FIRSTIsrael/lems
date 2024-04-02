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
  JudgingCategoryTypes,
  JudgingCategory,
  JudgingRoom,
  JudgingSession,
  SafeUser,
  Rubric,
  Team
} from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import { rubricsSchemas } from '@lems/season';
import Layout from '../../../../../../components/layout';
import RubricForm from '../../../../../../components/judging/rubrics/rubric-form';
import { RoleAuthorizer } from '../../../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../../../components/connection-indicator';
import { apiFetch, serverSideGetRequests } from '../../../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../../../hooks/use-websocket';
import { localizeTeam } from '../../../../../../localization/teams';
import { enqueueSnackbar } from 'notistack';

interface RubricSelectorProps {
  event: WithId<Event>;
  team: WithId<Team>;
  judgingCategory: JudgingCategory;
}

const RubricSelector: React.FC<RubricSelectorProps> = ({ event, team, judgingCategory }) => {
  return (
    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
      {JudgingCategoryTypes.map(category => (
        <NextLink
          key={category}
          href={`/event/${event._id}/team/${team._id}/rubric/${category}`}
          passHref
          legacyBehavior
        >
          <Button
            variant="contained"
            color="inherit"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: judgingCategory === category ? purple[700] : 'transparent',
              color: judgingCategory === category ? '#fff' : purple[700],
              borderRadius: '2rem',
              '&:hover': {
                backgroundColor: judgingCategory === category ? purple[700] : purple[700] + '1f'
              }
            }}
          >
            {localizedJudgingCategory[category].name}
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
  rubric: WithId<Rubric<JudgingCategory>>;
}

const Page: NextPage<Props> = ({ user, event, room, team, session, rubric: initialRubric }) => {
  const router = useRouter();
  if (!team.registered) {
    router.push(`/event/${event._id}/${user.role}`);
    enqueueSnackbar('הקבוצה טרם הגיעה לאירוע.', { variant: 'info' });
  }
  if (session.status !== 'completed') {
    router.push(`/event/${event._id}/${user.role}`);
    enqueueSnackbar('מפגש השיפוט טרם נגמר.', { variant: 'info' });
  }

  const judgingCategory: string =
    typeof router.query.judgingCategory === 'string' ? router.query.judgingCategory : '';
  const [rubric, setRubric] = useState<WithId<Rubric<JudgingCategory>>>(initialRubric);

  const { socket, connectionStatus } = useWebsocket(event._id.toString(), ['judging'], undefined, [
    {
      name: 'rubricUpdated',
      handler: rubric => {
        if (
          rubric.teamId === router.query.teamId &&
          rubric.category === router.query.judgingCategory
        )
          setRubric(rubric);
      }
    }
  ]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['judge', 'judge-advisor']}
      conditionalRoles={'lead-judge'}
      conditions={{ roleAssociation: { type: 'category', value: judgingCategory } }}
      onFail={() => router.push(`/event/${event._id}/${user.role}`)}
    >
      {team && (
        <Layout
          maxWidth="md"
          title={`מחוון ${
            localizedJudgingCategory[judgingCategory as JudgingCategory].name
          } של קבוצה #${team.number}, ${team.name} | ${event.name}`}
          error={connectionStatus === 'disconnected'}
          action={<ConnectionIndicator status={connectionStatus} />}
          back={`/event/${event._id}/${user.role}#${team.number.toString()}`}
          backDisabled={connectionStatus === 'connecting'}
        >
          <Paper sx={{ p: 3, mt: 4, mb: 2 }}>
            <Typography variant="h2" fontSize="1.25rem" fontWeight={500} align="center">
              {localizeTeam(team)} | חדר שיפוט {room.name}
            </Typography>
          </Paper>
          <RoleAuthorizer user={user} allowedRoles={['judge', 'judge-advisor']}>
            <RubricSelector
              event={event}
              team={team}
              judgingCategory={judgingCategory as JudgingCategory}
            />
          </RoleAuthorizer>
          <Box my={4}>
            <RubricForm
              event={event}
              team={team}
              user={user}
              rubric={rubric}
              schema={rubricsSchemas[judgingCategory as JudgingCategory]}
              socket={socket}
            />
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
      const sessions = await apiFetch(`/api/events/${user.eventId}/sessions`, undefined, ctx).then(
        res => res?.json()
      );
      roomId = sessions.find(
        (session: JudgingSession) => session.teamId == new ObjectId(String(ctx.params?.teamId))
      ).roomId;
    }

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.eventId}`,
        team: `/api/events/${user.eventId}/teams/${ctx.params?.teamId}`,
        room: `/api/events/${user.eventId}/rooms/${roomId}`,
        session: `/api/events/${user.eventId}/rooms/${roomId}/sessions`,
        rubric: `/api/events/${user.eventId}/teams/${ctx.query.teamId}/rubrics/${ctx.query.judgingCategory}`
      },
      ctx
    );

    data.session = data.session.find(
      (s: JudgingSession) => s.teamId == new ObjectId(String(ctx.params?.teamId))
    );

    return { props: { user, ...data } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
