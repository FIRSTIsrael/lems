import { useState, useCallback, useRef } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import {
  DivisionWithEvent,
  SafeUser,
  JudgingCategory,
  Rubric,
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom,
  CoreValuesForm,
  JudgingCategoryTypes,
  JudgingDeliberation,
  CoreValuesAwards,
  RANKING_ANOMALY_THRESHOLD,
  DeliberationAnomaly
} from '@lems/types';
import { fullMatch } from '@lems/utils/objects';
import { localizedJudgingCategory, makeCvValuesForRubric } from '@lems/season';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import Layout from '../../../../components/layout';
import { getUserAndDivision, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { DeliberationTeam } from '../../../../hooks/use-deliberation-teams';
import { Deliberation, DeliberationRef } from '../../../../components/deliberations/deliberation';
import CategoryDeliberationLayout from '../../../../components/deliberations/category/category-deliberations-layout';
import { getDefaultPicklistLimit } from '../../../../lib/utils/math';
import { localizeDivisionTitle } from '../../../../localization/event';

interface Props {
  category: JudgingCategory;
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  deliberation: WithId<JudgingDeliberation>;
  roomScores: Array<unknown>;
}

const Page: NextPage<Props> = ({
  category,
  user,
  division,
  teams,
  rubrics: initialRubrics,
  rooms,
  sessions,
  cvForms,
  scoresheets,
  deliberation: initialDeliberation,
  roomScores
}) => {
  const router = useRouter();
  const deliberationId = initialDeliberation._id;
  const deliberation = useRef<DeliberationRef>(null);
  const [rubrics, setRubrics] = useState(initialRubrics);

  if (!initialDeliberation.available) {
    router.push(`/lems/${user.role}`);
    enqueueSnackbar('הדיון טרם התחיל.', { variant: 'info' });
  }

  const checkElegibility = useCallback(() => true, []);

  const suggestTeam = (teams: Array<DeliberationTeam>, category?: JudgingCategory) => {
    if (teams.length < 2) return null;
    const getScores = (team: DeliberationTeam) => ({
      score: category ? team.scores[category] : team.totalScore,
      normalizedScore: category ? team.normalizedScores[category] : team.normalizedTotalScore
    });

    const sortedTeams = teams.sort((a, b) => {
      const aScores = getScores(a);
      const bScores = getScores(b);
      let place = bScores.score - aScores.score;
      if (place !== 0) return place;
      place = bScores.normalizedScore - aScores.normalizedScore; // Tiebreaker - Normalized score
      return place;
    });

    if (fullMatch(getScores(sortedTeams[0]), getScores(sortedTeams[1]))) return null;
    return sortedTeams[0];
  };

  const calculateAnomalies = (
    teams: Array<DeliberationTeam>,
    category: JudgingCategory,
    picklist: Array<ObjectId>
  ) => {
    const getScore = (team: DeliberationTeam) =>
      category ? team.scores[category] : team.totalScore;

    const anomalies = [];
    const sortedTeams = teams.sort((a, b) => getScore(b) - getScore(a));

    picklist.forEach((teamId, index) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const score = getScore(sortedTeams.find(t => t._id === teamId)!);
      const excludeTies = sortedTeams.filter(st => getScore(st) !== score || st._id === teamId);
      const rank = excludeTies.findIndex(st => st._id === teamId);
      if (index > rank + RANKING_ANOMALY_THRESHOLD) {
        anomalies.push({ teamId, reason: 'low-rank', category });
      }
      if (index < rank - RANKING_ANOMALY_THRESHOLD) {
        anomalies.push({ teamId, reason: 'high-rank', category });
      }
    });

    for (
      let index = 0;
      index < getDefaultPicklistLimit(teams.length) - RANKING_ANOMALY_THRESHOLD;
      index++
    ) {
      const teamId = sortedTeams[index]._id;
      if (!picklist.includes(teamId)) {
        anomalies.push({ teamId, reason: 'low-rank', category });
      }
    }

    return anomalies as Array<DeliberationAnomaly>;
  };

  const handleDeliberationEvent = (newDeliberation: WithId<JudgingDeliberation>) => {
    if (!deliberation.current) return;
    if (newDeliberation._id.toString() === deliberationId.toString()) {
      deliberation.current.sync(newDeliberation);
    }
  };

  const updateRubric = (rubric: WithId<Rubric<JudgingCategory>>) => {
    setRubrics(rubrics =>
      rubrics.map(r => {
        if (r._id === rubric._id) {
          if (rubric.category === 'core-values') {
            return makeCvValuesForRubric(rubric as WithId<Rubric<'core-values'>>, rubrics);
          }
          return rubric;
        }
        return r;
      })
    );
  };

  const { socket, connectionStatus } = useWebsocket(
    division._id.toString(),
    ['judging'],
    undefined,
    [
      { name: 'judgingDeliberationStarted', handler: handleDeliberationEvent },
      { name: 'judgingDeliberationCompleted', handler: handleDeliberationEvent },
      { name: 'judgingDeliberationUpdated', handler: handleDeliberationEvent },
      { name: 'rubricUpdated', handler: updateRubric }
    ]
  );

  const onChangeDeliberation = (newDeliberation: Partial<JudgingDeliberation>) => {
    if (deliberation.current?.status === 'completed') return;
    socket.emit(
      'updateJudgingDeliberation',
      division._id.toString(),
      deliberationId.toString(),
      newDeliberation,
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, עדכון דיון השיפוט נכשל.', { variant: 'error' });
        }
      }
    );
  };

  const updateTeamAwards = (
    teamId: ObjectId,
    rubricId: ObjectId,
    newAwards: { [key in CoreValuesAwards]: boolean }
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rubricUpdate: any = {};
    rubricUpdate['data.awards'] = newAwards;
    socket.emit(
      'updateRubric',
      division._id.toString(),
      teamId.toString(),
      rubricId.toString(),
      rubricUpdate,
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, עדכון דיון השיפוט נכשל.', { variant: 'error' });
        }
      }
    );
  };

  const startDeliberation = (deliberation: WithId<JudgingDeliberation>): void => {
    socket.emit(
      'startJudgingDeliberation',
      deliberation.divisionId.toString(),
      deliberation._id.toString(),
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, התחלת דיון השיפוט נכשלה.', { variant: 'error' });
        } else {
          new Audio('/assets/sounds/judging/judging-start.wav').play();
        }
      }
    );
  };

  const lockDeliberation = (deliberation: WithId<JudgingDeliberation>): void => {
    const { anomalies } = deliberation;
    socket.emit(
      'completeJudgingDeliberation',
      deliberation.divisionId.toString(),
      deliberation._id.toString(),
      { anomalies },
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, לא הצלחנו לנעול את הדיון.', {
            variant: 'error'
          });
        }
      }
    );
  };

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['lead-judge', 'judge-advisor']}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={1900}
        back={`/lems/${user.role}`}
        title={`דיון תחום ${localizedJudgingCategory[category].name} | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        user={user}
        division={division}
        color={division.color}
      >
        <Deliberation
          ref={deliberation}
          initialState={initialDeliberation}
          rooms={rooms}
          sessions={sessions}
          cvForms={cvForms}
          teams={teams}
          rubrics={rubrics}
          scoresheets={scoresheets}
          roomScores={roomScores}
          onChange={onChangeDeliberation}
          onStart={startDeliberation}
          onLock={lockDeliberation}
          checkEligibility={checkElegibility}
          suggestTeam={suggestTeam}
          updateTeamAwards={updateTeamAwards}
          calculateAnomalies={calculateAnomalies}
        >
          <CategoryDeliberationLayout />
        </Deliberation>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const { user, divisionId } = await getUserAndDivision(ctx);
    const category = ctx.params?.judgingCategory as JudgingCategory;

    if (!JudgingCategoryTypes.includes(category)) {
      return { notFound: true };
    }

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withEvent=true`,
        teams: `/api/divisions/${divisionId}/teams`,
        rubrics: `/api/divisions/${divisionId}/rubrics?makeCvValues=true`,
        rooms: `/api/divisions/${divisionId}/rooms`,
        sessions: `/api/divisions/${divisionId}/sessions`,
        scoresheets: `/api/divisions/${divisionId}/scoresheets`,
        cvForms: `/api/divisions/${divisionId}/cv-forms`,
        deliberation: `/api/divisions/${divisionId}/deliberations/category/${category}`,
        roomScores: `/api/divisions/${divisionId}/insights/judging/scores/rooms`
      },
      ctx
    );

    return { props: { user, ...data, category } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
