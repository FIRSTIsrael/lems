import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { Tabs, Tab, Paper } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { Event, EventState, SafeUser, Team } from '@lems/types';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import FieldInsightsDashboard from '../../../components/insights/dashboards/field';
import JudgingInsightsDashboard from '../../../components/insights/dashboards/judging';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import GeneralInsightsDashboard from '../../../components/insights/dashboards/general';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, event, eventState, teams }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('1');

  if (!eventState.completed) {
    router.push(`/event/${event._id}/${user.role}`);
    enqueueSnackbar('האירוע עוד לא הסתיים', { variant: 'info' });
  }
  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['judge-advisor', 'lead-judge', 'head-referee', 'tournament-manager']}
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ניתוח תחרות | ${event.name}`}
        back={`/event/${event._id}/${user.role}`}
        color={event.color}
      >
        <TabContext value={activeTab}>
          <Paper sx={{ mt: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_e: any, newValue: string) => setActiveTab(newValue)}
              centered
            >
              <Tab label="כללי" value="1" />
              <Tab label="זירה" value="2" />
              <Tab label="שיפוט" value="3" />
            </Tabs>
          </Paper>
          <TabPanel value="1">
            <GeneralInsightsDashboard event={event} teams={teams} />
          </TabPanel>
          <TabPanel value="2">
            <FieldInsightsDashboard event={event} />
          </TabPanel>
          <TabPanel value="3">
            <JudgingInsightsDashboard event={event} />
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
        eventState: `/api/events/${user.eventId}/state`,
        teams: `/api/events/${user.eventId}/teams`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
