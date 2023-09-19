import { useState } from 'react';
import { ObjectId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Button, Paper, Stack, Typography, Box } from '@mui/material';
import { purple } from '@mui/material/colors';
import NextLink from 'next/link';
import { Event, RobotGameMatch, RobotGameTable, SafeUser, Scoresheet, Team } from '@lems/types';
import Layout from '../../../../../../components/layout';
import { RoleAuthorizer } from '../../../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../../../components/connection-indicator';
import { apiFetch } from '../../../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../../../hooks/use-websocket';
import { localizeTeam } from '../../../../../../localization/teams';
import { localizedMatchType } from '../../../../../../localization/field';
import ScoresheetMission from '../../../../../../components/field/scoresheet/scoresheet-mission';
import { SEASON_SCORESHEET } from '@lems/season';

interface ScoresheetSelectorProps {
  event: WithId<Event>;
  team: WithId<Team>;
}

const ScoresheetSelector: React.FC<ScoresheetSelectorProps> = ({ event, team }) => {
  // TODO: this will make a button for each round appear for head refs
  return (
    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
      {[1, 2, 3, 4].map(match => (
        <NextLink
          key={match}
          href={`/event/${event._id}/team/${team._id}/scoresheet/${match}`}
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
  table: WithId<RobotGameTable>;
  team: WithId<Team>;
  match: WithId<RobotGameMatch>;
}

const Page: NextPage<Props> = ({ user, event, table, team, match }) => {
  const router = useRouter();
  const [scoresheet, setScoresheet] = useState<WithId<Scoresheet> | undefined>(undefined);
  // if (!team.registered) router.back();
  // if (session.status !== 'completed') router.back();

  const updateScoresheet = () => {
    apiFetch(`/api/events/${user.event}/tables/${table._id}/matches/${match._id}/scoresheet`)
      .then(res => res?.json())
      .then(data => setScoresheet(data));
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['field'],
    updateScoresheet,
    [
      {
        name: 'scoresheetUpdated',
        handler: (teamId, scoresheeId) => {
          if (scoresheeId === router.query.scoresheeId) updateScoresheet();
        }
      }
    ]
  );

  console.log(scoresheet);
  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['referee', 'head-referee']}
      onFail={() => router.back()}
    >
      {team && (
        <Layout
          maxWidth="md"
          title={`${localizedMatchType[match.type]} #${match.round} של קבוצה #${team.number}, ${
            team.name
          } | ${event.name}`}
          error={connectionStatus === 'disconnected'}
          action={<ConnectionIndicator status={connectionStatus} />}
          back={`/event/${event._id}/${user.role}`}
          backDisabled={connectionStatus !== 'connecting'}
        >
          <Paper sx={{ p: 3, mt: 4, mb: 2 }}>
            <Typography variant="h2" fontSize="1.25rem" fontWeight={500} align="center">
              {localizeTeam(team)} | שולחן {table.name}
            </Typography>
          </Paper>
          <RoleAuthorizer user={user} allowedRoles={['head-referee']}>
            <ScoresheetSelector event={event} team={team} />
          </RoleAuthorizer>
          <Stack spacing={4}>
            {SEASON_SCORESHEET.missions.map(mission => (
              <ScoresheetMission
                key={mission.id}
                src={`/assets/scoresheet/missions/${mission.id.toUpperCase()}.png`}
                mission={mission}
              />
            ))}
          </Stack>
        </Layout>
      )}
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    let tableId;
    if (user.roleAssociation && user.roleAssociation.type === 'table') {
      tableId = user.roleAssociation.value;
    } else {
      const matches = await apiFetch(`/api/events/${user.event}/matches`, undefined, ctx).then(
        res => res?.json()
      );
      tableId = matches.find(
        (match: RobotGameMatch) => match.team == new ObjectId(String(ctx.params?.teamId))
      ).table;
    }

    const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );

    const teamPromise = apiFetch(
      `/api/events/${user.event}/teams/${ctx.params?.teamId}`,
      undefined,
      ctx
    ).then(res => res?.json());

    const tablePromise = apiFetch(
      `/api/events/${user.event}/tables/${tableId}`,
      undefined,
      ctx
    ).then(res => res?.json());

    const [table, team, event] = await Promise.all([tablePromise, teamPromise, eventPromise]);

    const match = await apiFetch(
      `/api/events/${user.event}/tables/${tableId}/matches`,
      undefined,
      ctx
    ).then(res =>
      res?.json().then(matches => matches.find((m: RobotGameMatch) => m.team == team._id))
    );

    return { props: { user, event, table, team, match } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
