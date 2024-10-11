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
  DeliberationAnomaly
} from '@lems/types';
import ChampionsDeliberationsGrid from './champions-deliberation-grid';
import FinalDeliberationControlPanel from '../final-deliberation-control-panel';
import ChampionsPodium from './champions-podium';
import ScoresPerRoomChart from '../../../../components/insights/charts/scores-per-room-chart';
import AnomalyTeams from '../anomaly-teams';
import { apiFetch } from '../../../../lib/utils/fetch';

interface TeamWithRanks extends WithId<Team> {
  cvRank: number;
  ipRank: number;
  rdRank: number;
  rgRank: number;
  totalRank: number;
}

interface ChampionsDeliberationLayoutProps {
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  teamsWithRanks: Array<TeamWithRanks>;
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
  teamsWithRanks,
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
