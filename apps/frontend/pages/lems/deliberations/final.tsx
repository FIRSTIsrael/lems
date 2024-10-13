import { useState, useRef, useCallback, useMemo } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
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
  JudgingCategoryTypes,
  Award,
  FinalDeliberationStage,
  ADVANCEMENT_PERCENTAGE,
  AwardNames,
  CoreValuesAwards,
  CoreValuesAwardsTypes,
  PRELIMINARY_DELIBERATION_PICKLIST_LENGTH
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import ConnectionIndicator from '../../../components/connection-indicator';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import ChampionsDeliberationLayout from '../../../components/deliberations/final/champions/champions-deliberation-layout';
import CoreAwardsDeliberationLayout from '../../../components/deliberations/final/core-awards/core-awards-deliberation-layout';
import OptionalAwardsDeliberationLayout from '../../../components/deliberations/final/optional-awards/optional-awards-deliberation-layout';
import ReviewLayout from '../../../components/deliberations/final/review-layout';
import { Deliberation } from '../../../components/deliberations/deliberation';
import { DeliberationRef } from '../../../components/deliberations/deliberation';
import { DeliberationTeam } from '../../../hooks/use-deliberation-teams';

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
  deliberations: Array<WithId<JudgingDeliberation>>;
  robotConsistency: { avgRelStdDev: number; rows: Array<any> };
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
  const [privateDeliberation, setPrivateDeliberation] = useState<WithId<JudgingDeliberation>>(
    initialDeliberations.find(d => d.isFinalDeliberation)!
  ); // Store a local copy for stage changes.
  const deliberation = useRef<DeliberationRef>(null);
  const [awards, setAwards] = useState(initialAwards);

  if (!initialDeliberations.find(d => d.isFinalDeliberation)!.available) {
    router.push(`/lems/${user.role}`);
    enqueueSnackbar('הדיון טרם התחיל.', { variant: 'info' });
  }

  const checkChampionsElegibility = useCallback(
    (team: WithId<Team>, teams: Array<DeliberationTeam>) => {
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
        .slice(0, advancingTeams + 1);
      return !!shouldBeElegibile.find(t => t._id === team._id);
    },
    []
  );

  const checkCoreAwardsElegibility = useCallback(
    (team: WithId<Team>, teams: Array<DeliberationTeam>) => {
      const _team = teams.find(t => t._id === team._id)!;
      const { 'robot-game': robotGame, ...ranks } = _team.ranks;
      return Object.values(ranks).some(rank => rank <= PRELIMINARY_DELIBERATION_PICKLIST_LENGTH);
    },
    []
  );

  const checkOptionalAwardsElegibility = useCallback(
    (team: WithId<Team>, teams: Array<DeliberationTeam>) => {
      const _team = teams.find(t => t._id === team._id)!;
      return Object.values(_team.optionalAwardNominations).some(nomination => nomination);
    },
    []
  );

  const checkElegibility = useMemo(() => {
    switch (privateDeliberation.stage) {
      case 'champions':
        return checkChampionsElegibility;
      case 'core-awards':
        return checkCoreAwardsElegibility;
      case 'optional-awards':
        return checkOptionalAwardsElegibility;
      default:
        return () => true;
    }
  }, [privateDeliberation.stage]);

  const categoryRanks: { [key in JudgingCategory]: Array<ObjectId> } = initialDeliberations
    .filter(d => !d.isFinalDeliberation)
    .reduce(
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
    if (!deliberation.current) return;
    if (newDeliberation._id.toString() === privateDeliberation._id.toString()) {
      setPrivateDeliberation(newDeliberation);
      deliberation.current.sync(newDeliberation);
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

  const onChangeDeliberation = useCallback((newDeliberation: Partial<JudgingDeliberation>) => {
    if (deliberation.current?.status === 'completed') return;
    socket.emit(
      'updateJudgingDeliberation',
      division._id.toString(),
      privateDeliberation._id.toString(),
      newDeliberation,
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, עדכון דיון השיפוט נכשל.', { variant: 'error' });
        }
      }
    );
  }, []);

  const startDeliberationStage = useCallback((deliberation: WithId<JudgingDeliberation>): void => {
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
  }, []);

  const sendEndStageEvent = (
    deliberation: WithId<JudgingDeliberation>,
    nextStage: FinalDeliberationStage
  ) => {
    socket.emit(
      'updateJudgingDeliberation',
      division._id.toString(),
      deliberation._id.toString(),
      { status: 'not-started', stage: nextStage as FinalDeliberationStage },
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
  };

  const updateAwardWinners = (awards: { [key in AwardNames]?: Array<DeliberationTeam> }) => {
    return apiFetch(`/api/divisions/${division._id}/awards/winners`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(awards)
    }).then(res => {
      if (!res.ok) {
        enqueueSnackbar('אופס, לא הצלחנו לשמור את זוכי הפרסים.', { variant: 'error' });
      }
      return res.ok;
    });
  };

  const updateAwards = (awards: Array<Award>) => {
    return apiFetch(`/api/divisions/${division._id}/awards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(awards)
    }).then(res => {
      if (!res.ok) {
        enqueueSnackbar('אופס, לא הצלחנו לשמור את זוכי הפרסים.', { variant: 'error' });
      }
      return res.ok;
    });
  };

  const endChampionsStage = (
    deliberation: WithId<JudgingDeliberation>,
    eligibleTeams: Array<DeliberationTeam>,
    allTeams: Array<DeliberationTeam>
  ) => {
    const awardWinners = deliberation.awards['champions']!.map(
      teamId => eligibleTeams.find(t => t._id === teamId)!
    );

    const advancementAwards: Array<Award> = eligibleTeams
      .filter(team => !awardWinners.find(w => w._id === team._id))
      .map((team, index) => ({
        divisionId: division._id,
        name: 'advancement',
        index: -1,
        place: index + 1,
        winner: team
      }));

    const robotPerformanceWinners = allTeams
      .sort((a, b) => a.ranks['robot-game'] - b.ranks['robot-game'])
      .slice(0, awards.filter(award => award.name === 'robot-performance').length);

    return updateAwardWinners({
      champions: awardWinners,
      'robot-performance': robotPerformanceWinners
    }).then(ok => {
      if (ok) {
        return updateAwards(advancementAwards).then(ok => ok);
      } else {
        return false;
      }
    });
  };

  const endCoreAwardsStage = (
    deliberation: WithId<JudgingDeliberation>,
    eligibleTeams: Array<DeliberationTeam>,
    allTeams: Array<DeliberationTeam>
  ) => {
    const newAwards = JudgingCategoryTypes.reduce(
      (acc, category) => {
        acc[category] = deliberation.awards[category]!.map(
          teamId => eligibleTeams.find(t => t._id === teamId)!
        );
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
        acc[awardName] = deliberation.awards[awardName]!.map(
          teamId => eligibleTeams.find(t => t._id === teamId)!
        );
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
          endChampionsStage(deliberation, eligibleTeams, allTeams).then(ok => {
            if (ok) sendEndStageEvent(deliberation, 'core-awards');
          });
          break;
        }
        case 'core-awards': {
          endCoreAwardsStage(deliberation, eligibleTeams, allTeams).then(ok => {
            if (ok) sendEndStageEvent(deliberation, 'optional-awards');
          });
          break;
        }
        case 'optional-awards': {
          endOptionalAwardsStage(deliberation, eligibleTeams, allTeams).then(ok => {
            if (ok) sendEndStageEvent(deliberation, 'review');
          });
          break;
        }
        case 'review': {
          sendLockEvent(deliberation);
        }
      }

      apiFetch(`/api/divisions/${division._id}/awards`).then(res => {
        if (!res.ok) {
          enqueueSnackbar('אופס, עדכון הפרסים נכשל.', { variant: 'error' });
          return;
        }
        res.json().then(setAwards);
      });
    },
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
        title={`דיון סופי | בית ${division.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        color={division.color}
      >
        <Deliberation
          ref={deliberation}
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
          checkElegibility={checkElegibility}
        >
          {privateDeliberation.stage === 'champions' && <ChampionsDeliberationLayout />}
          {privateDeliberation.stage === 'core-awards' && <CoreAwardsDeliberationLayout />}
          {privateDeliberation.stage === 'optional-awards' && <OptionalAwardsDeliberationLayout />}
          {privateDeliberation.stage === 'review' && <ReviewLayout awards={awards} />}
        </Deliberation>
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
        robotConsistency: `/api/divisions/${user.divisionId}/insights/field/scores/consistency`,
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
