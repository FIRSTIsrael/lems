import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { DragDropContext } from 'react-beautiful-dnd';
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
  Award
} from '@lems/types';
import { fullMatch } from '@lems/utils/objects';
import LockOverlay from '../../../components/general/lock-overlay';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import ConnectionIndicator from '../../../components/connection-indicator';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import ChampionsDeliberationLayout from '../../../components/deliberations/final/champions/champions-deliberation-layout';
import CoreAwardsDeliberationLayout from '../../../components/deliberations/final/core-awards/core-awards-deliberation-layout';
import OptionalAwardsDeliberationLayout from '../../../components/deliberations/final/optional-awards/optional-awards-deliberation-layout';
import ReviewLayout from '../../../components/deliberations/final/review-layout';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  awards: Array<WithId<Award>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  rankings: { [key in JudgingCategory]: Array<ObjectId> };
  robotGameRankings: Array<ObjectId>;
  deliberations: Array<WithId<JudgingDeliberation>>;
}

const Page: NextPage<Props> = props => {
  const { user, division, deliberations: initialDeliberations } = props;
  const router = useRouter();
  const [deliberation, setDeliberation] = useState(
    initialDeliberations.find(d => d.isFinalDeliberation)
  );
  const categoryPicklists: { [key in JudgingCategory]: Array<ObjectId> } = initialDeliberations
    .filter(d => !d.isFinalDeliberation)
    .reduce(
      (acc, current) => ({ ...acc, [current.category!]: current.awards[current.category!] }),
      {
        'core-values': [],
        'robot-design': [],
        'innovation-project': []
      }
    );

  const anomalies = [
    ...new Set([
      ...initialDeliberations
        .filter(d => !d.isFinalDeliberation)
        .map(d => d.anomalies ?? [])
        .flat()
    ])
  ];

  if (!deliberation) {
    router.push(`/lems/${user.role}`);
    enqueueSnackbar('אירעה שגיאה!', { variant: 'error' });
    return; // This makes typescript understand that the rest of the code won't be reached
  }

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
        <DragDropContext onDragEnd={() => {}}>
          {deliberation.status === 'completed' && <LockOverlay />}
          {deliberation.stage === 'champions' && (
            <ChampionsDeliberationLayout
              {...props}
              deliberation={deliberation}
              anomalies={anomalies}
            />
          )}
          {deliberation.stage === 'core-awards' && (
            <CoreAwardsDeliberationLayout
              {...props}
              deliberation={deliberation}
              categoryPicklists={categoryPicklists}
              anomalies={anomalies}
            />
          )}
          {deliberation.stage === 'optional-awards' && (
            <OptionalAwardsDeliberationLayout {...props} deliberation={deliberation} />
          )}
          {deliberation.stage === 'review' && (
            <ReviewLayout division={division} deliberation={deliberation} />
          )}
        </DragDropContext>
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
        awards: `/api/divisions/${user.divisionId}/awards`,
        rubrics: `/api/divisions/${user.divisionId}/rubrics`,
        rooms: `/api/divisions/${user.divisionId}/rooms`,
        sessions: `/api/divisions/${user.divisionId}/sessions`,
        scoresheets: `/api/divisions/${user.divisionId}/scoresheets`,
        cvForms: `/api/divisions/${user.divisionId}/cv-forms`,
        rankings: `/api/divisions/${user.divisionId}/rankings/rubrics`,
        robotGameRankings: `/api/divisions/${user.divisionId}/rankings/robot-game`,
        deliberations: `/api/divisions/${user.divisionId}/deliberations`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
