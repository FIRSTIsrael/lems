import { useEffect, useMemo, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableSortLabel,
  TableRow,
  Box
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { Division, Team, SafeUser, RoleTypes } from '@lems/types';
import BooleanIcon from '../../../components/general/boolean-icon';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, division, teams: initialTeams }) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [sortBy, setSortBy] = useState<string>('number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const headCells = useMemo(
    () => [
      { label: 'מספר', sort: 'number' },
      { label: 'שם', sort: 'name' },
      { label: 'מוסד', sort: 'institution' },
      { label: 'עיר', sort: 'city' },
      {
        label: `הגעה (${teams.filter(t => t.registered).length}/${teams.length})`,
        sort: 'registration'
      }
    ],
    [teams]
  );

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

  useEffect(() => {
    const sortFunctions: { [key: string]: (a: WithId<Team>, b: WithId<Team>) => number } = {
      number: (a, b) => a.number - b.number,
      name: (a, b) => a.name.localeCompare(b.name),
      institution: (a, b) => a.affiliation.name.localeCompare(b.affiliation.name),
      city: (a, b) => a.affiliation.city.localeCompare(b.affiliation.city),
      registration: (a, b) => (b.registered ? 1 : -1)
    };

    const sorted = teams.sort(sortFunctions[sortBy]);
    if (sortDirection === 'desc') sorted.reverse();
    setTeams(sorted);
  }, [teams, sortBy, sortDirection]);

  const { connectionStatus } = useWebsocket(division._id.toString(), ['pit-admin'], undefined, [
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
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - רשימת קבוצות | ${division.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/division/${division._id}/reports`}
        backDisabled={connectionStatus === 'connecting'}
        color={division.color}
      >
        <Paper
          sx={{
            py: 4,
            px: 2,
            textAlign: 'center',
            mt: 4
          }}
        >
          <TableContainer>
            <Table aria-label="team list">
              <TableHead>
                <TableRow>
                  {headCells.map((cell, index) => (
                    <TableCell key={index} align="left">
                      <TableSortLabel
                        active={sortBy === cell.sort}
                        direction={sortBy === cell.sort ? sortDirection : 'asc'}
                        onClick={() => {
                          const isAsc = sortBy === cell.sort && sortDirection === 'asc';
                          setSortDirection(isAsc ? 'desc' : 'asc');
                          setSortBy(cell.sort);
                        }}
                      >
                        {cell.label}
                        {sortBy === cell.sort ? (
                          <Box component="span" sx={visuallyHidden}>
                            {sortDirection === 'desc' ? 'sorted descending' : 'sorted ascending'}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.map(team => {
                  return (
                    <TableRow key={team._id.toString()}>
                      <TableCell align="left">{team.number}</TableCell>
                      <TableCell align="left">{team.name}</TableCell>
                      <TableCell align="left">{team.affiliation.name}</TableCell>
                      <TableCell align="left">{team.affiliation.city}</TableCell>
                      <TableCell align="left">
                        <BooleanIcon condition={team.registered} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
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
        teams: `/api/divisions/${user.divisionId}/teams`
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
