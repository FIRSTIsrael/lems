import { useMemo } from 'react';
import { DivisionState, RobotGameMatch, RobotGameTable, Team } from '@lems/types';
import { Paper, Stack, Typography } from '@mui/material';
import { WithId } from 'mongodb';
import { localizedMatchStage } from '../../localization/field';
import { localizeTeam } from '../../localization/teams';
import ReportRoundSchedule from '../field/report-round-schedule';

interface McScheduleProps {
  divisionState: WithId<DivisionState>;
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
}

const McSchedule: React.FC<McScheduleProps> = ({ divisionState, teams, matches, tables }) => {
  const loadedMatch = useMemo(
    () => matches.find(m => m._id === divisionState.loadedMatch) || null,
    [matches, divisionState.loadedMatch]
  );

  const practiceMatches = matches.filter(m => m.status !== 'completed' && m.stage === 'practice');
  const rankingMatches = matches.filter(m => m.status !== 'completed' && m.stage === 'ranking');

  const roundSchedules = [...new Set(practiceMatches.flatMap(m => m.round))]
    .map(r => (
      <ReportRoundSchedule
        divisionSchedule={[]}
        roundStage="practice"
        roundNumber={r}
        matches={practiceMatches.filter(m => m.round === r)}
        tables={tables}
        teams={teams}
        extendedTeamInfo={true}
        key={'practice' + r}
      />
    ))
    .concat(
      [...new Set(rankingMatches.flatMap(m => m.round))].map(r => (
        <ReportRoundSchedule
          divisionSchedule={[]}
          roundStage="ranking"
          roundNumber={r}
          matches={rankingMatches.filter(m => m.round === r)}
          tables={tables}
          teams={teams}
          extendedTeamInfo={true}
          key={'ranking' + r}
        />
      ))
    );

  return (
    <>
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Typography fontSize="1.75rem" fontWeight={700} textAlign="center" mb={2}>
            המקצה הבא -{' '}
            {loadedMatch?.number
              ? `מקצה ${localizedMatchStage[loadedMatch?.stage]} #${loadedMatch?.number}`
              : loadedMatch?.stage === 'test'
                ? 'מקצה בדיקה'
                : 'אין מקצה טעון כרגע'}
          </Typography>
          {loadedMatch &&
            loadedMatch.participants
              .filter(p => p.teamId)
              .map((participant, index) => {
                const registered = teams.find(
                  t => t._id.toString() === participant.teamId?.toString()
                )?.registered;
                if (!registered) return;

                return (
                  <Typography fontSize="1.125rem" gutterBottom key={participant.teamId?.toString()}>
                    <b>שולחן {participant.tableName}:</b>{' '}
                    {participant.team && localizeTeam(participant.team)}
                  </Typography>
                );
              })}
        </Paper>
        {roundSchedules}
      </Stack>
    </>
  );
};

export default McSchedule;
