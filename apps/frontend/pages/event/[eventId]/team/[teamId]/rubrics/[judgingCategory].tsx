import { useState } from 'react';
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
  SafeUser,
  Rubric,
  Team
} from '@lems/types';
import Layout from '../../../../../../components/layout';
import RubricForm from '../../../../../../components/judging/rubrics/rubric-form';
import { RoleAuthorizer } from '../../../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../../../components/connection-indicator';
import { localizedJudgingCategory } from '../../../../../../localization/judging';
import rubricsSchemas from '../../../../../../localization/rubric-schemas';
import { apiFetch } from '../../../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../../../hooks/use-websocket';

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
          href={`/event/${event._id}/team/${team._id}/rubrics/${category}`}
          passHref
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
}

const Page: NextPage<Props> = ({ user, event, room }) => {
  const router = useRouter();
  const judgingCategory: string =
    typeof router.query.judgingCategory === 'string' ? router.query.judgingCategory : '';
  const [team, setTeam] = useState<WithId<Team> | undefined>(undefined);
  const [rubric, setRubric] = useState<WithId<Rubric<JudgingCategory>> | undefined>(undefined);

  const schema = rubricsSchemas[judgingCategory as JudgingCategory];
  const flatMap = schema.sections.flatMap(section => section.rubrics.map(rubric => rubric.id));
  const awardCandidates = schema.awards?.map(award => award.id) || [];

  const updateTeam = () => {
    apiFetch(`/api/events/${user.event}/teams/${router.query.teamId}`)
      .then(res => res?.json())
      .then(data => {
        setTeam(data);
      });
  };

  const updateRubric = () => {
    apiFetch(`/api/events/${user.event}/teams/${router.query.teamId}/rubrics/${judgingCategory}`)
      .then(res => res?.json())
      .then(data => setRubric(data));
  };

  const updateData = () => {
    updateTeam();
    updateRubric();
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['pit-admin', 'judging'],
    updateData,
    [
      { name: 'teamRegistered', handler: updateTeam },
      { name: 'rubricUpdated', handler: updateRubric }
    ]
  );

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
              קבוצה #{team.number}, {team.name} | {team.affiliation.institution},{' '}
              {team.affiliation.city} | חדר שיפוט {room.name}
            </Typography>
          </Paper>
          <RoleAuthorizer user={user} allowedRoles={['judge', 'judge-advisor']}>
            <RubricSelector
              event={event}
              team={team}
              judgingCategory={judgingCategory as JudgingCategory}
            />
          </RoleAuthorizer>
          {JSON.stringify(awardCandidates)}
          {JSON.stringify(flatMap)}
          <Box my={4}>
            <RubricForm event={event} team={team} rubric={rubric} />
          </Box>
        </Layout>
      )}
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );
    const roomPromise = apiFetch(
      `/api/events/${user.event}/rooms/${user.roleAssociation.value}`,
      undefined,
      ctx
    ).then(res => res?.json());
    const [room, event] = await Promise.all([roomPromise, eventPromise]);

    return { props: { user, event, room } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
