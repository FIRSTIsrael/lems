import { useState } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Paper } from '@mui/material';
import { CoreValuesForm, DivisionWithEvent, SafeUser, Team } from '@lems/types';
import { useWebsocket } from '../../../hooks/use-websocket';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import CVForm from '../../../components/cv-form/cv-form';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizeDivisionTitle } from '../../../localization/event';

interface Props {
  user: WithId<SafeUser>;
  teams: Array<WithId<Team>>;
  division: WithId<DivisionWithEvent>;
  cvForm: WithId<CoreValuesForm>;
}

const Page: NextPage<Props> = ({ user, teams, division, cvForm: initialCvForm }) => {
  const router = useRouter();
  const [cvForm, setCvForm] = useState<WithId<CoreValuesForm>>(initialCvForm);

  const { socket, connectionStatus } = useWebsocket(
    division._id.toString(),
    ['judging'],
    undefined,
    [
      {
        name: 'cvFormUpdated',
        handler: cvf => {
          if (cvf._id === cvForm._id) setCvForm(cvForm);
        }
      }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['judge-advisor', 'tournament-manager']}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`טופס ערכי ליבה | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        back={`/lems/${user.role}`}
        backDisabled={connectionStatus === 'connecting'}
        user={user}
        division={division}
        color={division.color}
      >
        <Paper sx={{ p: 4, my: 2 }}>
          <CVForm
            user={user}
            division={division}
            teams={teams.filter(team => team.registered)}
            socket={socket}
            cvForm={cvForm}
            readOnly={true}
            onSubmit={() => router.push(`/lems/${user.role}`)}
          />
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
        teams: `/api/divisions/${divisionId}/teams`,
        cvForm: `/api/divisions/${divisionId}/cv-forms/${ctx.params?.cvFormId}`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
