import { useState } from 'react';
import dayjs from 'dayjs';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Division,
  SafeUser,
  JudgingCategory,
  Rubric,
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom,
  CoreValuesForm,
  JudgingDeliberation,
  AwardNames,
  MANDATORY_AWARD_PICKLIST_LENGTH
} from '@lems/types';
import { reorder } from '@lems/utils/arrays';
import { fullMatch } from '@lems/utils/objects';
import ScoresPerRoomChart from '../../../components/insights/charts/scores-per-room-chart';
import TeamPool from '../../../components/deliberations/team-pool';
import AwardList from '../../../components/deliberations/award-list';
import DeliberationControlPanel from '../../../components/deliberations/deliberation-control-panel';
import LockOverlay from '../../../components/general/lock-overlay';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import ConnectionIndicator from '../../../components/connection-indicator';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import { DragDropContext } from 'react-beautiful-dnd';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  deliberation: WithId<JudgingDeliberation>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  teams,
  rubrics: initialRubrics,
  rooms,
  sessions,
  cvForms,
  scoresheets,
  deliberation: initialDeliberation
}) => {
  const router = useRouter();
  const [deliberation, setDeliberation] = useState(initialDeliberation);
  const [rubrics, setRubrics] = useState(initialRubrics);

  console.log(deliberation);
  if (!deliberation.available) {
    router.push(`/lems/${user.role}`);
    enqueueSnackbar('הדיון טרם התחיל.', { variant: 'info' });
  }

  const handleDeliberationEvent = (newDeliberation: WithId<JudgingDeliberation>) => {
    if (
      newDeliberation._id.toString() === deliberation._id.toString() &&
      !fullMatch(newDeliberation, deliberation)
    ) {
      setDeliberation(newDeliberation);
    }
  };

  const { socket, connectionStatus } = useWebsocket(
    division._id.toString(),
    ['judging'],
    undefined,
    [
      { name: 'judgingDeliberationStarted', handler: handleDeliberationEvent },
      { name: 'judgingDeliberationCompleted', handler: handleDeliberationEvent },
      { name: 'judgingDeliberationUpdated', handler: handleDeliberationEvent }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['judge-advisor']}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={1900}
        back={`/lems/${user.role}`}
        title={`דיון סופי | בית ${division.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        color={division.color}
      >
        {deliberation.status === 'completed' && <LockOverlay />}
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
        teams: `/api/divisions/${user.divisionId}/teams`,
        rubrics: `/api/divisions/${user.divisionId}/rubrics`,
        rooms: `/api/divisions/${user.divisionId}/rooms`,
        sessions: `/api/divisions/${user.divisionId}/sessions`,
        scoresheets: `/api/divisions/${user.divisionId}/scoresheets`,
        cvForms: `/api/divisions/${user.divisionId}/cv-forms`,
        deliberation: `/api/divisions/${user.divisionId}/deliberations/final`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
