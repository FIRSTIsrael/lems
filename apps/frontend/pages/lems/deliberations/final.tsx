import { useEffect, useState } from 'react';
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
  Award,
  FinalDeliberationStage,
  AwardNames,
  MANDATORY_AWARD_PICKLIST_LENGTH
} from '@lems/types';
import { fullMatch } from '@lems/utils/objects';
import { reorder } from '@lems/utils/arrays';
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
  rankings: { [key in JudgingCategory]: Array<{ teamId: ObjectId; rank: number }> };
  robotGameRankings: Array<ObjectId>;
  deliberations: Array<WithId<JudgingDeliberation>>;
  robotConsistency: { avgRelStdDev: number; rows: Array<any> };
}

const Page: NextPage<Props> = props => {
  const { user, division, deliberations: initialDeliberations, awards: initialAwards } = props;
  const router = useRouter();
  const [deliberation, setDeliberation] = useState(
    initialDeliberations.find(d => d.isFinalDeliberation)
  );
  const [awards, setAwards] = useState(initialAwards);

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

  const nonDeliberatedRanks = Object.entries(props.rankings).reduce(
    (acc, [key, value]) => {
      const filteredValue: Array<{ teamId: ObjectId; rank: number; newRank?: number }> =
        value.filter(({ teamId }) => !categoryPicklists[key as JudgingCategory].includes(teamId));

      filteredValue[0].newRank = 1;
      for (var i = 1; i < filteredValue.length; i++) {
        if (filteredValue[i].rank === filteredValue[i - 1].rank) {
          filteredValue[i].newRank = filteredValue[i - 1].newRank;
        } else {
          filteredValue[i].newRank = i + 1;
        }
      }

      return {
        ...acc,
        [key]: filteredValue.map(({ teamId, newRank }) => ({ teamId, rank: newRank }))
      };
    },
    {} as { [key in JudgingCategory]: Array<{ teamId: ObjectId; rank: number }> }
  );

  const calculateRank = (teamId: ObjectId, category: JudgingCategory | 'robot-game') => {
    let rank: number;
    if (category === 'robot-game') {
      rank = props.robotGameRankings.findIndex(id => id === teamId);
      return rank >= 0 ? rank + 1 : props.teams.filter(team => team.registered).length;
    } else {
      rank = categoryPicklists[category].findIndex(id => id === teamId);
      if (rank >= 0) return rank + 1;
      const team = nonDeliberatedRanks[category].find(entry => entry.teamId === teamId);
      if (!team) {
        return props.teams.filter(team => team.registered).length;
      }
      return team.rank + MANDATORY_AWARD_PICKLIST_LENGTH;
    }
  };

  const teamsWithRanks = props.teams
    .filter(team => team.registered)
    .map(team => {
      const cvRank = calculateRank(team._id, 'core-values');
      const ipRank = calculateRank(team._id, 'innovation-project');
      const rdRank = calculateRank(team._id, 'robot-design');
      const rgRank = calculateRank(team._id, 'robot-game');
      return {
        ...team,
        cvRank,
        ipRank,
        rdRank,
        rgRank,
        totalRank: (cvRank + ipRank + rdRank + rgRank) / 4
      };
    });

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

  const setPicklist = (name: AwardNames, newList: Array<ObjectId>) => {
    setPicklists({ [name]: newList });
  };

  const setPicklists = (newPicklists: { [key in AwardNames]?: Array<ObjectId> }) => {
    const newDeliberation = { ...deliberation };
    newDeliberation.awards = { ...deliberation.awards, ...newPicklists };

    setDeliberation(newDeliberation);
    socket.emit(
      'updateJudgingDeliberation',
      division._id.toString(),
      deliberation._id.toString(),
      { awards: newDeliberation.awards },
      response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, עדכון דיון השיפוט נכשל.', { variant: 'error' });
        }
      }
    );
  };

  const getPicklist = (name: AwardNames) => {
    return [...(deliberation.awards[name] ?? [])];
  };

  const isTeamInPicklist = (teamId: string, name: AwardNames) => {
    return !!getPicklist(name).find(id => id.toString() === teamId);
  };

  const addTeamToPicklist = (teamId: string, index: number, name: AwardNames) => {
    const picklist: Array<string | ObjectId> = [...getPicklist(name)];
    if (picklist.length >= awards.filter(award => award.name === name).length) return;
    if (picklist.includes(teamId)) return;

    picklist.splice(index, 0, teamId);
    setPicklist(name, picklist as Array<ObjectId>);
  };

  const removeTeamFromPicklist = (teamId: string, name: AwardNames) => {
    const newPicklist = getPicklist(name).filter(id => id.toString() !== teamId);
    setPicklist(name, newPicklist);
  };

  const moveTeamBetweenPicklists = (
    teamId: string,
    source: AwardNames,
    destination: AwardNames,
    index: number
  ) => {
    let destinationPicklist: Array<string | ObjectId> = [...getPicklist(destination)];
    if (destinationPicklist.length >= awards.filter(award => award.name === destination).length) {
      return;
    }

    let sourcePicklist: Array<string | ObjectId> = [...getPicklist(source)];
    sourcePicklist = sourcePicklist.filter(id => id !== teamId);
    destinationPicklist.splice(index, 0, teamId);
    setPicklists({ [source]: sourcePicklist, [destination]: destinationPicklist });
  };

  const startDeliberationStage = (deliberation: WithId<JudgingDeliberation>): void => {
    socket.emit(
      'startJudgingDeliberation',
      division._id.toString(),
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

  const endDeliberationStage = (deliberation: WithId<JudgingDeliberation>): void => {
    let nextStage: string;
    switch (deliberation.stage) {
      case 'champions':
        nextStage = 'core-awards';
        break;
      case 'core-awards':
        nextStage = 'optional-awards';
        break;
      case 'optional-awards':
        nextStage = 'review';
        break;
    }

    apiFetch(`/api/divisions/${division._id}/awards`).then(res => {
      if (!res.ok) {
        enqueueSnackbar('אופס, עדכון הפרסים נכשל.', { variant: 'error' });
        return;
      }
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
      res.json().then(setAwards);
    });
  };

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
        <DragDropContext
          onDragEnd={result => {
            const { source, destination, draggableId } = result;
            if (!destination) {
              return;
            }
            const teamId = draggableId.split(':')[1];

            if (destination.droppableId === 'trash') {
              if (source.droppableId === 'team-pool') {
                return;
              }
              removeTeamFromPicklist(teamId, source.droppableId as AwardNames);
              return;
            }

            const destinationList = destination.droppableId as AwardNames;
            switch (source.droppableId) {
              case 'team-pool':
                if (isTeamInPicklist(teamId, destinationList)) {
                  return;
                }
                addTeamToPicklist(teamId, destination.index, destinationList);
                break;
              case destination.droppableId:
                const reordered = reorder(
                  getPicklist(destinationList),
                  source.index,
                  destination.index
                );
                setPicklist(destinationList, reordered);
                break;
              default:
                moveTeamBetweenPicklists(
                  teamId,
                  source.droppableId as AwardNames,
                  destinationList,
                  destination.index
                );
                break;
            }
          }}
        >
          {deliberation.status === 'completed' && <LockOverlay />}
          {deliberation.stage === 'champions' && (
            <ChampionsDeliberationLayout
              {...props}
              teamsWithRanks={teamsWithRanks}
              setPicklist={newList => setPicklist('champions', newList)}
              startDeliberationStage={startDeliberationStage}
              endDeliberationStage={endDeliberationStage}
              categoryPicklists={categoryPicklists}
              deliberation={deliberation}
              anomalies={anomalies}
              awards={awards}
            />
          )}
          {deliberation.stage === 'core-awards' && (
            <CoreAwardsDeliberationLayout
              {...props}
              teamsWithRanks={teamsWithRanks}
              startDeliberationStage={startDeliberationStage}
              endDeliberationStage={endDeliberationStage}
              deliberation={deliberation}
              categoryPicklists={categoryPicklists}
              anomalies={anomalies}
              awards={awards}
            />
          )}
          {deliberation.stage === 'optional-awards' && (
            <OptionalAwardsDeliberationLayout
              {...props}
              startDeliberationStage={startDeliberationStage}
              endDeliberationStage={endDeliberationStage}
              deliberation={deliberation}
              awards={awards}
            />
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
