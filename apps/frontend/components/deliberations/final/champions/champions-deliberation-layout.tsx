import { useMemo } from 'react';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Division,
  JudgingCategory,
  Rubric,
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom,
  CoreValuesForm,
  JudgingDeliberation,
  ADVANCEMENT_PERCENTAGE,
  Award,
  DeliberationAnomaly,
  JudgingCategoryTypes,
  MANDATORY_AWARD_PICKLIST_LENGTH
} from '@lems/types';
import ChampionsDeliberationsGrid from './champions-deliberation-grid';
import FinalDeliberationControlPanel from '../final-deliberation-control-panel';
import ChampionsPodium from './champions-podium';
import ScoresPerRoomChart from '../../../../components/insights/charts/scores-per-room-chart';
import AnomalyTeams from '../anomaly-teams';
import { apiFetch } from '../../../../lib/utils/fetch';

interface ChampionsDeliberationLayoutProps {
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
  deliberation: WithId<JudgingDeliberation>;
  anomalies: Array<DeliberationAnomaly>;
  robotConsistency: { avgRelStdDev: number; rows: Array<any> };
  categoryPicklists: { [key in JudgingCategory]: Array<ObjectId> };
  setPicklist: (newList: Array<ObjectId>) => void;
  startDeliberationStage: (deliberation: WithId<JudgingDeliberation>) => void;
  endDeliberationStage: (deliberation: WithId<JudgingDeliberation>) => void;
}

const ChampionsDeliberationLayout: React.FC<ChampionsDeliberationLayoutProps> = ({
  division,
  teams,
  awards,
  rubrics,
  rooms,
  sessions,
  scoresheets,
  cvForms,
  rankings,
  robotGameRankings,
  deliberation,
  anomalies,
  robotConsistency,
  categoryPicklists,
  setPicklist,
  startDeliberationStage,
  endDeliberationStage
}) => {
  const advancingTeams = Math.round(teams.length * ADVANCEMENT_PERCENTAGE);
  const championsAwards = awards.filter(award => award.name === 'champions').length;

  const nonDeliberatedRanks = Object.entries(rankings).reduce(
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
      rank = robotGameRankings.findIndex(id => id === teamId);
      return rank >= 0 ? rank + 1 : teams.filter(team => team.registered).length;
    } else {
      rank = categoryPicklists[category].findIndex(id => id === teamId);
      if (rank >= 0) return rank + 1;
      const team = nonDeliberatedRanks[category].find(entry => entry.teamId === teamId);
      if (!team) {
        return teams.filter(team => team.registered).length;
      }
      return team.rank + MANDATORY_AWARD_PICKLIST_LENGTH;
    }
  };

  const teamsWithRanks = teams
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

  const elegibleTeams = useMemo(
    () =>
      teamsWithRanks
        .sort((a, b) => {
          let place = a.totalRank - b.totalRank;
          if (place !== 0) return place;
          place = a.cvRank - b.cvRank; // Tiebreaker 1 - CV score
          if (place !== 0) return place;
          place = b.number - a.number; // Tiebreaker 2 - Team Number
          return place;
        })
        .filter(t => !deliberation.disqualifications.includes(t._id))
        .slice(0, advancingTeams),
    [deliberation.disqualifications]
  );

  const endChampionsStage = (deliberation: WithId<JudgingDeliberation>) => {
    const awardWinners = deliberation.awards['champions']!.map(
      teamId => teams.find(t => t._id === teamId)!
    );

    const advancementAwards: Array<Award> = elegibleTeams
      .filter(team => !awardWinners.find(w => w._id === team._id))
      .map((team, index) => ({
        divisionId: division._id,
        name: 'advancement',
        index: -1,
        place: index + 1,
        winner: team
      }));

    const robotPerformanceWinners = teamsWithRanks
      .sort((a, b) => b.rgRank - a.rgRank)
      .slice(0, awards.filter(award => award.name === 'robot-performance').length);

    apiFetch(`/api/divisions/${division._id}/awards/winners`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        champions: awardWinners,
        'robot-performance': robotPerformanceWinners
      })
    }).then(res => {
      if (!res.ok) {
        enqueueSnackbar('אופס, לא הצלחנו לשמור את זוכי הפרסים.', { variant: 'error' });
      }
      apiFetch(`/api/divisions/${division._id}/awards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(advancementAwards)
      }).then(res => {
        if (!res.ok) {
          enqueueSnackbar('אופס, לא הצלחנו לשמור את זוכי הפרסים.', { variant: 'error' });
        }
        endDeliberationStage(deliberation);
      });
    });
  };

  return (
    <Grid container pt={2} columnSpacing={4} rowSpacing={2}>
      <Grid xs={7}>
        <ChampionsDeliberationsGrid
          teams={elegibleTeams}
          rooms={rooms}
          sessions={sessions}
          cvForms={cvForms}
          scoresheets={scoresheets}
          anomalies={anomalies}
          robotConsistency={robotConsistency}
        />
      </Grid>
      <Grid xs={2}>
        <AnomalyTeams teams={teamsWithRanks} anomalies={anomalies} />
      </Grid>
      <Grid xs={3}>
        <FinalDeliberationControlPanel
          teams={elegibleTeams}
          deliberation={deliberation}
          cvForms={cvForms}
          rubrics={rubrics}
          scoresheets={scoresheets}
          nextStageUnlocked={deliberation.awards['champions']?.length === championsAwards}
          startDeliberation={startDeliberationStage}
          endDeliberationStage={endChampionsStage}
        />
      </Grid>
      <Grid xs={6}>
        <ChampionsPodium
          places={championsAwards}
          teams={elegibleTeams}
          award={deliberation.awards['champions'] ?? []}
          setAward={setPicklist}
          disabled={deliberation.status !== 'in-progress'}
        />
      </Grid>
      <Grid xs={6}>
        <ScoresPerRoomChart division={division} height={210} />
      </Grid>
    </Grid>
  );
};

export default ChampionsDeliberationLayout;
