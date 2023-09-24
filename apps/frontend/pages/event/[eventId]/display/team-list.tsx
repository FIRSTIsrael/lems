import { useEffect, useState } from 'react';
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
import { Event, Team, JudgingRoom, SafeUser } from '@lems/types';
import BooleanIcon from '../../../../components/general/boolean-icon';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { apiFetch } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';
import { useWebsocket } from '../../../../hooks/use-websocket';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  rooms: Array<WithId<JudgingRoom>>;
}

const Page: NextPage<Props> = ({ user, event, rooms }) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>([]);
  const [sortBy, setSortBy] = useState<string>('number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const headCells = [
    { label: 'מספר', sort: 'number' },
    { label: 'שם', sort: 'name' },
    { label: 'מוסד', sort: 'institution' },
    { label: 'עיר', sort: 'city' },
    { label: 'רישום', sort: 'registration' }
  ];

  const updateTeams = () => {
    apiFetch(`/api/events/${user.event}/teams`)
      .then(res => res?.json())
      .then(data => {
        setTeams(data);
      });
  };

  useEffect(() => {
    const sortFunctions: { [key: string]: (a: WithId<Team>, b: WithId<Team>) => number } = {
      number: (a, b) => a.number - b.number,
      name: (a, b) => a.name.localeCompare(b.name),
      institution: (a, b) => a.affiliation.institution.localeCompare(b.affiliation.institution),
      city: (a, b) => a.affiliation.city.localeCompare(b.affiliation.city),
      registration: (a, b) => (b.registered ? 1 : -1)
    };

    setTeams(teams.sort(sortFunctions[sortBy]));
  }, [teams, sortBy]);

  const { connectionStatus } = useWebsocket(event._id.toString(), ['pit-admin'], updateTeams, [
    { name: 'teamRegistered', handler: updateTeams }
  ]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['display', 'head-referee']}
      onFail={() => router.back()}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - רשימת קבוצות | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/event/${event._id}/display`}
        backDisabled={connectionStatus !== 'connecting'}
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
                    <TableCell key={index}>
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
                  <TableCell align="left">מספר</TableCell>
                  <TableCell align="left">שם</TableCell>
                  <TableCell align="left">מוסד</TableCell>
                  <TableCell align="left">עיר</TableCell>
                  <TableCell align="left">רישום</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.map(team => {
                  return (
                    <TableRow key={team._id.toString()}>
                      <TableCell align="left">{team.number}</TableCell>
                      <TableCell align="left">{team.name}</TableCell>
                      <TableCell align="left">{team.affiliation.institution}</TableCell>
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

    const event = await apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );

    return { props: { user, event } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
