import { useState, useRef, useCallback, useMemo } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import {
  SafeUser,
  JudgingCategory,
  Rubric,
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom,
  CoreValuesForm,
  JudgingDeliberation,
  JudgingCategoryTypes,
  Award,
  FinalDeliberationStage,
  ADVANCEMENT_PERCENTAGE,
  AwardNames,
  CoreValuesAwards,
  CoreValuesAwardsTypes,
  DivisionWithEvent
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import ChampionsDeliberationLayout from '../../../components/deliberations/final/champions/champions-deliberation-layout';
import CoreAwardsDeliberationLayout from '../../../components/deliberations/final/core-awards/core-awards-deliberation-layout';
import OptionalAwardsDeliberationLayout from '../../../components/deliberations/final/optional-awards/optional-awards-deliberation-layout';
import ReviewLayout from '../../../components/deliberations/final/review-layout';
import { Deliberation } from '../../../components/deliberations/deliberation';
import { DeliberationRef } from '../../../components/deliberations/deliberation';
import { DeliberationTeam } from '../../../hooks/use-deliberation-teams';
import { getDefaultPicklistLimit } from '../../../lib/utils/math';
import { localizeDivisionTitle } from '../../../localization/event';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  teams: Array<WithId<Team>>;
  awards: Array<WithId<Award>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  deliberations: Array<WithId<JudgingDeliberation>>;
  robotConsistency: { avgRelStdDev: number; rows: Array<unknown> };
}

const Page: NextPage<Props> = ({
  user,
  division,
  teams,
  awards: initialAwards,
  rubrics,
  rooms,
  sessions,
  scoresheets,
  cvForms,
  deliberations: initialDeliberations,
  robotConsistency
}) => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const deliberationId = initialDeliberations.find(d => d.isFinalDeliberation)!._id;
  const [currentStage, setCurrentStage] = useState<FinalDeliberationStage>(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    initialDeliberations.find(d => d.isFinalDeliberation)!.stage!
  ); // Store a local copy for stage changes.
  const deliberation = useRef<DeliberationRef>(null);
  const [awards, setAwards] = useState(initialAwards);

  if (!initialDeliberations.find(d => d.isFinalDeliberation)?.available) {
    router.push(`/lems/${user.role}`);
    enqueueSnackbar('הדיון טרם התחיל.', { variant: 'info' });
  }

  const checkChampionsElegibility = (
    team: WithId<Team>,
    teams: Array<DeliberationTeam>,
    disqualifications: Array<ObjectId>
  ) => {
    const advancingTeams = Math.round(teams.length * ADVANCEMENT_PERCENTAGE);
    const shouldBeElegibile = teams
      .sort((a, b) => {
        let place = a.totalRank - b.totalRank;
        if (place !== 0) return place;
        place = a.ranks['core-values'] - b.ranks['core-values']; // Tiebreaker 1 - CV score
        if (place !== 0) return place;
        place = b.number - a.number; // Tiebreaker 2 - Team Number
        return place;
      })
      .filter(t => !disqualifications.includes(t._id))
      .slice(0, advancingTeams + 1);
    return !!shouldBeElegibile.find(t => t._id === team._id);
  };

  const checkCoreAwardsElegibility = (team: WithId<Team>, teams: Array<DeliberationTeam>) => {
    const _team = teams.find(t => t._id === team._id);
    if (!_team) return false;
    const { 'robot-game': robotGame, ...ranks } = _team.ranks;
    return Object.values(ranks).some(rank => rank <= getDefaultPicklistLimit(teams.length));
  };

  const checkOptionalAwardsElegibility = (team: WithId<Team>, teams: Array<DeliberationTeam>) => {
    const _team = teams.find(t => t._id === team._id);
    if (!_team) return false;
    return Object.values(_team.optionalAwardNominations).some(nomination => nomination);
  };

  const checkElegibility = useMemo(() => {
    switch (currentStage) {
      case 'champions':
        return checkChampionsElegibility;
      case 'core-awards':
        return checkCoreAwardsElegibility;
      case 'optional-awards':
        return checkOptionalAwardsElegibility;
      default:
        return () => true;
    }
  }, [currentStage]);

  const categoryRanks: { [key in JudgingCategory]: Array<ObjectId> } = initialDeliberations
    .filter(d => !d.isFinalDeliberation)
    .reduce(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (acc, current) => ({ ...acc, [current.category!]: current.awards[current.category!] }),
      {} as { [key in JudgingCategory]: Array<ObjectId> }
    );

  const anomalies = [
    ...new Set([
      ...initialDeliberations
        .filter(d => !d.isFinalDeliberation)
        .map(d => d.anomalies ?? [])
        .flat()
    ])
  ];

  const handleDeliberationEvent = (newDeliberation: WithId<JudgingDeliberation>) => {
    if (newDeliberation._id.toString() === deliberationId.toString()) {
      if (!deliberation.current) return;
      deliberation.current.sync(newDeliberation);
      if (newDeliberation.stage && newDeliberation.stage !== currentStage) {
        setCurrentStage(newDeliberation.stage);
      }
    }
  };

  const { socket, connectionStatus } = useWebsocket(
    division._id.toString(),
    ['judging'],
    undefined,
    [
      { name: 'awardsUpdated', handler: setAwards },
      { name: 'judgingDeliberationStarted', handler: handleDeliberationEvent },
      { name: 'judgingDeliberationCompleted', handler: handleDeliberationEvent },
      { name: 'judgingDeliberationUpdated', handler: handleDeliberationEvent }
    ]
  );

  const onChangeDeliberation = useCallback(
    (newDeliberation: Partial<JudgingDeliberation>) => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deliberation.current]
  );

  const startDeliberationStage = useCallback(
    (deliberation: WithId<JudgingDeliberation>): void => {
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
    },
    [socket]
  );

  const sendEndStageEvent = (
    deliberation: WithId<JudgingDeliberation>,
    nextStage: FinalDeliberationStage
  ) => {
    socket.emit(
      'updateJudgingDeliberation',
      division._id.toString(),
      deliberation._id.toString(),
      { status: 'not-started', stage: nextStage as FinalDeliberationStage, manualEligibility: [] },
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, עדכון דיון השיפוט נכשל.', { variant: 'error' });
        }
      }
    );
  };

  const sendLockEvent = (deliberation: WithId<JudgingDeliberation>) => {
    socket.emit(
      'completeJudgingDeliberation',
      deliberation.divisionId.toString(),
      deliberation._id.toString(),
      {},
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, לא הצלחנו לנעול את הדיון.', {
            variant: 'error'
          });
        }
      }
    );
    socket.emit(
      'updatePresentation',
      division._id.toString(),
      'awards',
      { enabled: true },
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, לא הצלחנו לנעול את הדיון.', {
            variant: 'error'
          });
        }
      }
    );
  };

  const updateAwardWinners = (awards: { [key in AwardNames]?: Array<DeliberationTeam> }) => {
    socket.emit('updateAwardWinners', division._id.toString(), awards, response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, לא הצלחנו לעדכן את הפרסים.', {
          variant: 'error'
        });
      }
    });
  };

  const advanceTeams = (teams: Array<DeliberationTeam>) => {
    socket.emit('advanceTeams', division._id.toString(), teams, response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, לא הצלחנו לעדכן את הפרסים.', {
          variant: 'error'
        });
      }
    });
  };

  const endChampionsStage = (
    deliberation: WithId<JudgingDeliberation>,
    eligibleTeams: Array<DeliberationTeam>,
    allTeams: Array<DeliberationTeam>
  ) => {
    const awardWinners = (deliberation.awards['champions'] ?? [])
      .map(teamId => eligibleTeams.find(t => t._id === teamId))
      .filter(team => !!team);

    const robotPerformanceWinners = allTeams
      .sort((a, b) => a.ranks['robot-game'] - b.ranks['robot-game'])
      .slice(0, awards.filter(award => award.name === 'robot-performance').length);

    advanceTeams(eligibleTeams.filter(team => !awardWinners.find(w => w._id === team._id)));
    updateAwardWinners({
      champions: awardWinners,
      'robot-performance': robotPerformanceWinners
    });
  };

  const endCoreAwardsStage = (
    deliberation: WithId<JudgingDeliberation>,
    eligibleTeams: Array<DeliberationTeam>,
    allTeams: Array<DeliberationTeam>
  ) => {
    const newAwards = JudgingCategoryTypes.reduce(
      (acc, category) => {
        acc[category] = (deliberation.awards[category] ?? [])
          .map(teamId => eligibleTeams.find(t => t._id === teamId))
          .filter(team => !!team);
        return acc;
      },
      {} as { [key in JudgingCategory]: Array<DeliberationTeam> }
    );

    const excellenceInEngineeringWinners = eligibleTeams
      .sort((a, b) => a.totalRank - b.totalRank)
      .filter(
        team =>
          !Object.values(newAwards)
            .flat(1)
            .find(t => t._id === team._id)
      )
      .slice(0, awards.filter(award => award.name === 'excellence-in-engineering').length);

    return updateAwardWinners({
      ...newAwards,
      'excellence-in-engineering': excellenceInEngineeringWinners
    });
  };

  const endOptionalAwardsStage = (
    deliberation: WithId<JudgingDeliberation>,
    eligibleTeams: Array<DeliberationTeam>,
    allTeams: Array<DeliberationTeam>
  ) => {
    const newAwards = CoreValuesAwardsTypes.reduce(
      (acc, awardName) => {
        acc[awardName] = (deliberation.awards[awardName] ?? [])
          .map(teamId => eligibleTeams.find(t => t._id === teamId))
          .filter(team => !!team);
        return acc;
      },
      {} as { [key in CoreValuesAwards]: Array<DeliberationTeam> }
    );

    return updateAwardWinners(newAwards);
  };

  const endDeliberationStage = useCallback(
    (
      deliberation: WithId<JudgingDeliberation>,
      eligibleTeams: Array<DeliberationTeam>,
      allTeams: Array<DeliberationTeam>
    ): void => {
      switch (deliberation.stage) {
        case 'champions': {
          endChampionsStage(deliberation, eligibleTeams, allTeams);
          sendEndStageEvent(deliberation, 'core-awards');
          break;
        }
        case 'core-awards': {
          endCoreAwardsStage(deliberation, eligibleTeams, allTeams);
          sendEndStageEvent(deliberation, 'optional-awards');
          break;
        }
        case 'optional-awards': {
          endOptionalAwardsStage(deliberation, eligibleTeams, allTeams);
          sendEndStageEvent(deliberation, 'review');
          break;
        }
        case 'review': {
          sendLockEvent(deliberation);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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
        title={`דיון סופי | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        user={user}
        division={division}
        color={division.color}
      >
        <Deliberation
          ref={deliberation}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          initialState={initialDeliberations.find(d => d.isFinalDeliberation)!}
          rooms={rooms}
          sessions={sessions}
          cvForms={cvForms}
          teams={teams}
          rubrics={rubrics}
          scoresheets={scoresheets}
          categoryRanks={categoryRanks}
          robotConsistency={robotConsistency.rows}
          awards={awards}
          anomalies={anomalies}
          onChange={onChangeDeliberation}
          onStart={startDeliberationStage}
          endStage={endDeliberationStage}
          checkEligibility={checkElegibility}
        >
          {currentStage === 'champions' && <ChampionsDeliberationLayout />}
          {currentStage === 'core-awards' && <CoreAwardsDeliberationLayout />}
          {currentStage === 'optional-awards' && <OptionalAwardsDeliberationLayout />}
          {currentStage === 'review' && <ReviewLayout awards={awards} onSubmit={sendLockEvent} />}
        </Deliberation>
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
        awards: `/api/divisions/${divisionId}/awards`,
        rubrics: `/api/divisions/${divisionId}/rubrics?makeCvValues=true`,
        rooms: `/api/divisions/${divisionId}/rooms`,
        sessions: `/api/divisions/${divisionId}/sessions`,
        scoresheets: `/api/divisions/${divisionId}/scoresheets`,
        cvForms: `/api/divisions/${divisionId}/cv-forms`,
        robotConsistency: `/api/divisions/${divisionId}/insights/field/scores/consistency`,
        deliberations: `/api/divisions/${divisionId}/deliberations`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
