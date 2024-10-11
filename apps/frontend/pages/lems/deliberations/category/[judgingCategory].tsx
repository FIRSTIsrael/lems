import { useState, useMemo } from 'react';
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
  JudgingCategoryTypes,
  JudgingDeliberation,
  AwardNames,
  CoreValuesAwards,
  MANDATORY_AWARD_PICKLIST_LENGTH,
  RANKING_ANOMALY_THRESHOLD,
  DeliberationAnomaly
} from '@lems/types';
import { average, reorder } from '@lems/utils/arrays';
import { fullMatch } from '@lems/utils/objects';
import { localizedJudgingCategory } from '@lems/season';
import CategoryDeliberationsGrid from '../../../../components/deliberations/category/category-deliberations-grid';
import ScoresPerRoomChart from '../../../../components/insights/charts/scores-per-room-chart';
import TeamPool from '../../../../components/deliberations/team-pool';
import AwardList from '../../../../components/deliberations/award-list';
import CategoryDeliberationControlPanel from '../../../../components/deliberations/category/category-deliberation-control-panel';
import LockOverlay from '../../../../components/general/lock-overlay';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import Layout from '../../../../components/layout';
import ConnectionIndicator from '../../../../components/connection-indicator';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { DragDropContext } from 'react-beautiful-dnd';

interface Props {
  category: JudgingCategory;
  user: WithId<SafeUser>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  deliberation: WithId<JudgingDeliberation>;
  roomScores: Array<any>;
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
  const [deliberation, setDeliberation] = useState(initialDeliberation);
  const [rubrics, setRubrics] = useState(initialRubrics);

  if (!deliberation.available) {
    router.push(`/lems/${user.role}`);
    enqueueSnackbar('הדיון טרם התחיל.', { variant: 'info' });
  }

  const averageScore = average(roomScores.map(room => room[category]));
  const roomFactors = roomScores.reduce(
    (acc, current) => ({ ...acc, [current.roomId]: averageScore / current[category] }),
    {}
  );

  const availableTeams = teams
    .filter(t => t.registered)
    .filter(t => rubrics.find(r => r.teamId === t._id)?.status !== 'empty')
    .filter(t => !deliberation.disqualifications.includes(t._id))
    .sort((a, b) => a.number - b.number);

  const selectedTeams = [...new Set(Object.values(deliberation.awards).flat(1))].map(
    teamId => teams.find(t => t._id === teamId) ?? ({} as WithId<Team>)
  );
  const unselectedTeams = availableTeams.filter(t => !selectedTeams.find(st => t._id === st._id));

  const suggestedTeam = useMemo(() => {
    const teamsWithScores = unselectedTeams.map(team => {
      const rubric = rubrics
        .filter(r => r.category === category && r.status !== 'empty')
        .find(r => r.teamId.toString() === team._id.toString());
      const rubricValues = rubric?.data?.values || {};
      let score = Object.values(rubricValues).reduce((acc, current) => acc + current.value, 0);
      if (category === 'core-values') {
        scoresheets
          .filter(scoresheet => scoresheet.teamId === team._id && scoresheet.stage === 'ranking')
          .forEach(scoresheet => (score += scoresheet.data?.gp?.value || 3));
      }

      const roomId = sessions.find(s => s.teamId === team._id)!.roomId;
      const normalizedScore = score * roomFactors[roomId.toString()];

      return { ...team, score, normalizedScore };
    });

    teamsWithScores.sort((a, b) => {
      let place = b.score - a.score;
      if (place !== 0) return place;
      place = b.normalizedScore - a.normalizedScore; // Tiebreaker - Normalized score
      return place;
    });
    if (
      teamsWithScores[0].score === teamsWithScores[1].score &&
      teamsWithScores[0].normalizedScore === teamsWithScores[1].normalizedScore
    )
      return null;
    return teamsWithScores[0];
  }, [unselectedTeams]);

  const handleDeliberationEvent = (newDeliberation: WithId<JudgingDeliberation>) => {
    if (
      newDeliberation._id.toString() === deliberation._id.toString() &&
      !fullMatch(newDeliberation, deliberation)
    ) {
      setDeliberation(newDeliberation);
    }
  };

  const updateRubric = (rubric: WithId<Rubric<JudgingCategory>>) => {
    setRubrics(rubrics =>
      rubrics.map(r => {
        if (r._id === rubric._id) return rubric;
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

  const getPicklist = (name: AwardNames) => {
    return [...(deliberation.awards[name] ?? [])];
  };

  const isTeamInPicklist = (teamId: string, name: AwardNames) => {
    return !!getPicklist(name).find(id => id.toString() === teamId);
  };

  const setPicklist = (name: AwardNames, newList: Array<ObjectId>) => {
    const newDeliberation = { ...deliberation };
    newDeliberation.awards[name] = newList;

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

  const addTeamToPicklist = (teamId: string, index: number, name: AwardNames) => {
    const picklist: Array<string | ObjectId> = [...getPicklist(name)];
    if (picklist.length >= MANDATORY_AWARD_PICKLIST_LENGTH) {
      return;
    }

    picklist.splice(index, 0, teamId);
    setPicklist(name, picklist as Array<ObjectId>);
  };

  const removeTeamFromPicklist = (teamId: string, name: AwardNames) => {
    const newPicklist = getPicklist(name).filter(id => id.toString() !== teamId);
    setPicklist(name, newPicklist);
  };

  const updateTeamAwards = (
    teamId: ObjectId,
    rubricId: ObjectId,
    newAwards: { [key in CoreValuesAwards]: boolean }
  ) => {
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

  const startDeliberation = (divisionId: string, deliberationId: string): void => {
    socket.emit('startJudgingDeliberation', divisionId, deliberationId, response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, התחלת דיון השיפוט נכשלה.', { variant: 'error' });
      } else {
        new Audio('/assets/sounds/judging/judging-start.wav').play();
      }
    });
  };

  const lockDeliberation = (deliberation: WithId<JudgingDeliberation>): void => {
    const anomalies = getRankingAnomalies();
    socket.emit(
      'completeJudgingDeliberation',
      division._id.toString(),
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

  const getRankingAnomalies = () => {
    const anomalies = [];
    const picklist = getPicklist(category as AwardNames);

    const sortedTeams = teams
      .map(team => {
        const rubric = rubrics.find(r => r.teamId === team._id && r.category === category);
        let sum = Object.values(rubric?.data?.values || {}).reduce(
          (acc, current) => acc + current.value,
          0
        );
        if (category === 'core-values') {
          scoresheets
            .filter(scoresheet => scoresheet.teamId === team._id && scoresheet.stage === 'ranking')
            .forEach(scoresheet => (sum += scoresheet.data?.gp?.value || 3));
        }
        return { _id: team._id, score: sum };
      })
      .sort((a, b) => b.score - a.score);

    picklist.forEach((teamId, rankAfterDeliberation) => {
      const score = sortedTeams.find(t => t._id === teamId)!.score;
      const sortedTeamsWithoutTies = sortedTeams.filter(
        st => st.score !== score || st._id === teamId
      );
      const rank = sortedTeamsWithoutTies.findIndex(st => st._id === teamId);

      if (rankAfterDeliberation > rank + RANKING_ANOMALY_THRESHOLD) {
        anomalies.push({ teamId, reason: 'low-rank', category });
      }
      if (rankAfterDeliberation < rank - RANKING_ANOMALY_THRESHOLD) {
        anomalies.push({ teamId, reason: 'high-rank', category });
      }
    });

    for (
      let index = 0;
      index < MANDATORY_AWARD_PICKLIST_LENGTH - RANKING_ANOMALY_THRESHOLD;
      index++
    ) {
      const teamId = sortedTeams[index]._id;
      if (!picklist.includes(teamId)) {
        anomalies.push({ teamId, reason: 'low-rank', category });
      }
    }

    return anomalies as Array<DeliberationAnomaly>;
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
        title={`דיון תחום ${localizedJudgingCategory[category].name} | בית ${division.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        color={division.color}
      >
        {deliberation.status === 'completed' && <LockOverlay />}
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
                removeTeamFromPicklist(teamId, source.droppableId as AwardNames);
                addTeamToPicklist(teamId, destination.index, destinationList);
                break;
            }
          }}
        >
          <Grid container sx={{ pt: 2 }} columnSpacing={4} rowSpacing={2}>
            <Grid xs={8}>
              <CategoryDeliberationsGrid
                category={category}
                rooms={rooms}
                rubrics={rubrics}
                scoresheets={scoresheets}
                sessions={sessions}
                teams={availableTeams}
                selectedTeams={selectedTeams}
                cvForms={cvForms}
                updateTeamAwards={updateTeamAwards}
                disabled={deliberation.status !== 'in-progress'}
                roomFactors={roomFactors}
              />
            </Grid>
            <Grid xs={1.5}>
              <AwardList
                id={category}
                pickList={
                  deliberation.awards[category as AwardNames]?.map(
                    teamId => teams.find(t => t._id === teamId) ?? ({} as WithId<Team>)
                  ) ?? []
                }
                disabled={deliberation.status !== 'in-progress'}
                suggestedTeam={suggestedTeam}
                addSuggestedTeam={teamId => {
                  const index = getPicklist(category).length;
                  addTeamToPicklist(teamId.toString(), index, category);
                }}
              />
            </Grid>
            <Grid xs={2.5}>
              <CategoryDeliberationControlPanel
                teams={availableTeams}
                deliberation={deliberation}
                startDeliberation={startDeliberation}
                lockDeliberation={lockDeliberation}
                category={category}
                cvForms={cvForms}
                rubrics={rubrics}
                scoresheets={scoresheets}
              />
            </Grid>
            <Grid xs={5}>
              <ScoresPerRoomChart division={division} height={210} />
            </Grid>
            <Grid xs={7}>
              <TeamPool
                teams={unselectedTeams}
                id="team-pool"
                disabled={deliberation.status !== 'in-progress'}
              />
            </Grid>
          </Grid>
        </DragDropContext>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());
    const category = ctx.params?.judgingCategory as JudgingCategory;

    if (!JudgingCategoryTypes.includes(category)) {
      return { notFound: true };
    }

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${user.divisionId}`,
        teams: `/api/divisions/${user.divisionId}/teams`,
        rubrics: `/api/divisions/${user.divisionId}/rubrics/${ctx.params?.judgingCategory}`,
        rooms: `/api/divisions/${user.divisionId}/rooms`,
        sessions: `/api/divisions/${user.divisionId}/sessions`,
        scoresheets: `/api/divisions/${user.divisionId}/scoresheets`,
        cvForms: `/api/divisions/${user.divisionId}/cv-forms`,
        deliberation: `/api/divisions/${user.divisionId}/deliberations/${ctx.params?.judgingCategory}`,
        roomScores: `/api/divisions/${user.divisionId}/insights/judging/scores/rooms`
      },
      ctx
    );

    return { props: { user, ...data, category } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
