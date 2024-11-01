import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import {
  Division,
  SafeUser,
  RobotGameMatch,
  RobotGameTable,
  DivisionState,
  Team
} from '@lems/types';
import { RoleAuthorizer } from '../../components/role-authorizer';
import ConnectionIndicator from '../../components/connection-indicator';
import Layout from '../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../lib/utils/fetch';
import { useWebsocket } from '../../hooks/use-websocket';
import StrictRefereeDisplay from '../../components/field/referee/strict-referee-display';
import { enqueueSnackbar } from 'notistack';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  divisionState: WithId<DivisionState>;
  teams: Array<WithId<Team>>;
  table: WithId<RobotGameTable>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState: initialDivisionState,
  teams: initialTeams,
  table,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);

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
    newDivisionState?: WithId<DivisionState>
  ) => {
    updateMatches(newMatch);
    if (newDivisionState) setDivisionState(newDivisionState);
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

    setMatches(matches =>
      matches.map(m => {
        const teamIndex = m.participants
          .filter(p => p.teamId)
          .findIndex(p => p.teamId === team._id);
        if (teamIndex !== -1) {
          const newMatch = structuredClone(m);
          newMatch.participants[teamIndex].team = team;
          return newMatch;
        }
        return m;
      })
    );
  };

  const { socket, connectionStatus } = useWebsocket(
    division._id.toString(),
    ['field', 'pit-admin'],
    undefined,
    [
      { name: 'matchLoaded', handler: handleMatchEvent },
      { name: 'matchStarted', handler: handleMatchEvent },
      { name: 'matchAborted', handler: handleMatchEvent },
      { name: 'matchCompleted', handler: handleMatchEvent },
      { name: 'matchUpdated', handler: updateMatches },
      { name: 'teamRegistered', handler: handleTeamRegistered }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="referee"
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={800}
        title={`שולחן ${table.name} | ${division.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        color={division.color}
      >
        <StrictRefereeDisplay
          division={division}
          divisionState={divisionState}
          table={table}
          teams={teams}
          matches={matches}
          socket={socket}
        />
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
        divisionState: `/api/divisions/${user.divisionId}/state`,
        teams: `/api/divisions/${user.divisionId}/teams`,
        table: `/api/divisions/${user.divisionId}/tables/${user.roleAssociation.value}`,
        matches: `/api/divisions/${user.divisionId}/tables/${user.roleAssociation.value}/matches`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
