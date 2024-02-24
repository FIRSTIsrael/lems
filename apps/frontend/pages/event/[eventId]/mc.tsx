import { useState } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Paper, Tabs, Tab } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { Event, EventState, RobotGameMatch, SafeUser, Team } from '@lems/types';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import McSchedule from '../../../components/mc/mc-schedule';
import AwardsLineup from '../../../components/mc/awards-lineup';
import AwardsNotReadyCard from '../../../components/mc/awards-not-ready-card';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  teams: initialTeams,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('1');
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id == team._id) {
          return team;
        }
        return t;
      })
    );
  };

  const handleMatchEvent = (match: WithId<RobotGameMatch>, newEventState?: WithId<EventState>) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === match._id) {
          return match;
        }
        return m;
      })
    );

    if (newEventState) setEventState(newEventState);
  };

  useWebsocket(event._id.toString(), ['field', 'pit-admin', 'audience-display'], undefined, [
    { name: 'teamRegistered', handler: handleTeamRegistered },
    { name: 'matchLoaded', handler: handleMatchEvent },
    { name: 'matchStarted', handler: handleMatchEvent },
    { name: 'matchAborted', handler: handleMatchEvent },
    { name: 'matchCompleted', handler: handleMatchEvent },
    { name: 'matchUpdated', handler: handleMatchEvent },
    { name: 'audienceDisplayUpdated', handler: setEventState },
    { name: 'presentationUpdated', handler: setEventState }
  ]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['mc']}
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="lg"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
      >
        <TabContext value={activeTab}>
          <Paper sx={{ mt: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue: string) => setActiveTab(newValue)}
              centered
            >
              <Tab label='לו"ז זירה' value="1" />
              <Tab label="פרסים" value="2" />
            </Tabs>
          </Paper>
          <TabPanel value="1">
            <McSchedule eventState={eventState} teams={teams} matches={matches} />
          </TabPanel>
          <TabPanel value="2">
            {eventState.presentations['awards']?.enabled ? (
              <AwardsLineup event={event} />
            ) : (
              <AwardsNotReadyCard />
            )}
          </TabPanel>
        </TabContext>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.eventId}`,
        teams: `/api/events/${user.eventId}/teams`,
        eventState: `/api/events/${user.eventId}/state`,
        matches: `/api/events/${user.eventId}/matches`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
