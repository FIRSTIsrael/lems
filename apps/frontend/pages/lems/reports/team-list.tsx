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
  Box,
  IconButton
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import ContactPageRoundedIcon from '@mui/icons-material/ContactPageRounded';
import { DivisionWithEvent, Team, SafeUser, RoleTypes, Role } from '@lems/types';
import BooleanIcon from '../../../components/general/boolean-icon';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';
import { localizeDivisionTitle } from '../../../localization/event';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, division, teams: initialTeams }) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [sortBy, setSortBy] = useState<string>('number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const headCells = useMemo<{
    [key: string]: { label: string; sort: string; allowedRoles?: Array<Role> };
  }>(
    () => ({
      number: { label: 'מספר', sort: 'number' },
      name: { label: 'שם', sort: 'name' },
      institution: { label: 'מוסד', sort: 'institution' },
      city: { label: 'עיר', sort: 'city' },
      registration: {
        label: `הגעה (${teams.filter(t => t.registered).length}/${teams.length})`,
        sort: 'registration'
      },
      profileDocumentUrl: {
        label: 'דף מידע',
        sort: 'profileDocumentUrl',
        allowedRoles: ['head-referee']
      }
    }),
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
      registration: (a, b) => (b.registered ? 1 : -1),
      profileDocumentUrl: (a, b) => (b.profileDocumentUrl ? 1 : -1)
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
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - רשימת קבוצות | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        user={user}
        division={division}
        back={`/lems/reports`}
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
                  {Object.values(headCells).map((cell, index) => (
                    <RoleAuthorizer
                      key={index}
                      user={user}
                      allowedRoles={cell.allowedRoles ?? [...RoleTypes]}
                    >
                      <TableCell align="left">
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
                    </RoleAuthorizer>
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
                      <RoleAuthorizer
                        user={user}
                        allowedRoles={headCells.profileDocumentUrl.allowedRoles}
                      >
                        <TableCell align="left">
                          <IconButton
                            href={team.profileDocumentUrl ?? ''}
                            disabled={!team.profileDocumentUrl}
                            color="info"
                            target="_blank"
                          >
                            <ContactPageRoundedIcon />
                          </IconButton>
                        </TableCell>
                      </RoleAuthorizer>
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
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withEvent=true`,
        teams: `/api/divisions/${divisionId}/teams`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
