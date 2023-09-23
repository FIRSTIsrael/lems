import { useState, useCallback } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Chip, List, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { Event, Team, SafeUser, RobotGameMatch, RobotGameTable, EventState } from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { apiFetch } from '../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../hooks/use-websocket';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, event, table }) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<EventState | undefined>(undefined);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>> | undefined>(undefined);

  const fetchMatches = useCallback(() => {
    apiFetch(`/api/events/${user.event}/tables/${table._id}/matches`)
      .then(res => res.json())
      .then(data => {
        setMatches(data);
      });
  }, [table._id, user.event]);

  const fetchInitialData = () => {
    apiFetch(`/api/events/${user.event}/state`)
      .then(res => res.json())
      .then(data => {
        setEventState(data);
      });

    fetchMatches();
  };

  const handleMatchLoaded = (matchNumber: number) => {
    setEventState(prev => (prev ? { ...prev, loadedMatch: matchNumber } : prev));
  };

  const { connectionStatus } = useWebsocket(event._id.toString(), ['field'], fetchInitialData, [
    { name: 'matchLoaded', handler: handleMatchLoaded },
    { name: 'matchStarted', handler: fetchMatches },
    { name: 'matchCompleted', handler: fetchMatches },
    { name: 'matchSubmitted', handler: fetchMatches }
  ]);

  const activeMatches = matches?.filter(
    m =>
      m.status === 'in-progress' || m.status !== 'scoring' || m.number === eventState?.loadedMatch
  );

  return (
    <RoleAuthorizer user={user} allowedRoles="referee" onFail={() => router.back()}>
      <Layout
        maxWidth={800}
        title={`שולחן ${table.name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        <Paper sx={{ p: 4, my: 6 }}>
          {activeMatches?.length === 0 ? (
            <Typography fontSize="xl" fontWeight={500} align="center">
              אין מקצים פעילים
            </Typography>
          ) : (
            <List>
              {activeMatches?.map(match => (
                <NextLink
                  key={match._id.toString()}
                  href={`/event/${event._id}/referee/matches/${match._id}`}
                  passHref
                  legacyBehavior
                >
                  <ListItemButton sx={{ borderRadius: 2 }} component="a">
                    <ListItemText
                      primary={`מקצה ${match.number}`}
                      secondary={`${match.team?.affiliation.name}, ${match.team?.affiliation.city}`}
                    />
                    {match.status === 'in-progress' && (
                      <Chip label="התחיל" color="primary" size="small" />
                    )}
                    {match.status === 'scoring' && (
                      <Chip label="הסתיים, ממתין לניקוד" size="small" />
                    )}
                  </ListItemButton>
                </NextLink>
              ))}
            </List>
          )}
        </Paper>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );
    const tablePromise = apiFetch(
      `/api/events/${user.event}/tables/${user.roleAssociation.value}`,
      undefined,
      ctx
    ).then(res => res?.json());

    const [table, event] = await Promise.all([tablePromise, eventPromise]);

    return { props: { user, event, table } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
