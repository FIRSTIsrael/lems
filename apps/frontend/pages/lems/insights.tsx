import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { Tabs, Tab, Paper } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { DivisionWithEvent, DivisionState, SafeUser, Team } from '@lems/types';
import Layout from '../../components/layout';
import { RoleAuthorizer } from '../../components/role-authorizer';
import FieldInsightsDashboard from '../../components/insights/dashboards/field';
import JudgingInsightsDashboard from '../../components/insights/dashboards/judging';
import { getUserAndDivision, serverSideGetRequests } from '../../lib/utils/fetch';
import GeneralInsightsDashboard from '../../components/insights/dashboards/general';
import { useQueryParam } from '../../hooks/use-query-param';
import { localizeDivisionTitle } from '../../localization/event';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  divisionState: WithId<DivisionState>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, division, divisionState, teams }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useQueryParam('tab', '1');

  if (!divisionState.completed) {
    router.push(`/lems/${user.role}`);
    enqueueSnackbar('האירוע עוד לא הסתיים', { variant: 'info' });
  }
  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['judge-advisor', 'lead-judge', 'head-referee', 'tournament-manager']}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ניתוח תחרות | ${localizeDivisionTitle(division)}`}
        back={`/lems/${user.role}`}
        color={division.color}
        user={user}
        division={division}
      >
        <TabContext value={activeTab}>
          <Paper sx={{ mt: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue: string) => setActiveTab(newValue)}
              centered
            >
              <Tab label="כללי" value="1" />
              <Tab label="זירה" value="2" />
              <Tab label="שיפוט" value="3" />
            </Tabs>
          </Paper>
          <TabPanel value="1">
            <GeneralInsightsDashboard division={division} teams={teams} />
          </TabPanel>
          <TabPanel value="2">
            <FieldInsightsDashboard division={division} />
          </TabPanel>
          <TabPanel value="3">
            <JudgingInsightsDashboard division={division} />
          </TabPanel>
        </TabContext>
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
        divisionState: `/api/divisions/${divisionId}/state`,
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
