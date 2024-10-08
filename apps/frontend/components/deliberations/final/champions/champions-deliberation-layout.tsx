import { useMemo, useState } from 'react';
import { ObjectId, WithId } from 'mongodb';
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

interface ChampionsDeliberationLayoutProps {
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
  deliberation: WithId<JudgingDeliberation>;
  anomalies: Array<DeliberationAnomaly>;
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
  anomalies
}) => {
  const advancingTeams = Math.round(teams.length * ADVANCEMENT_PERCENTAGE);
  const championsAwards = awards.filter(award => award.name === 'champions');
  const teamsWithRanks = teams
    .filter(team => team.registered)
    .map(team => {
      const calculateRank = (index: number) => (index === -1 ? teams.length + 1 : index + 1);
      const cvRank = calculateRank(rankings['core-values'].findIndex(id => id === team._id));
      const ipRank = calculateRank(rankings['innovation-project'].findIndex(id => id === team._id));
      const rdRank = calculateRank(rankings['robot-design'].findIndex(id => id === team._id));
      const rgRank = calculateRank(robotGameRankings.findIndex(id => id === team._id));
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

  //TODO: hook up to deliberation
  const places = championsAwards.length;
  const [picklist, setPicklist] = useState<Array<ObjectId | null>>(
    [...Array(places).keys()].map(i => null)
  );

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
        />
      </Grid>
      <Grid xs={6}>
        <ChampionsPodium
          teams={elegibleTeams}
          award={picklist}
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
