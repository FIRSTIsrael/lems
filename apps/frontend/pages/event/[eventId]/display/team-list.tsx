import { useState } from 'react';
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
  TableRow
} from '@mui/material';
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
  const defaultSortKey = 'number';

  //TODO: have a way for user to select sort
  const sortFunctions: { [key: string]: (a: WithId<Team>, b: WithId<Team>) => number } = {
    number: (a, b) => a.number - b.number,
    name: (a, b) => a.name.localeCompare(b.name),
    affiliationName: (a, b) => a.affiliation.name.localeCompare(b.affiliation.name),
    city: (a, b) => a.affiliation.city.localeCompare(b.affiliation.city),
    registration: (a, b) => (b.registered ? 1 : -1)
  };

  const updateTeams = () => {
    apiFetch(`/api/events/${user.event}/teams`)
      .then(res => res?.json())
      .then(data => {
        const sortKey: string =
          typeof router.query.sort === 'string' ? router.query.sort : defaultSortKey;

        data.sort(sortFunctions[sortKey]);

        setTeams(data);
      });
  };

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
