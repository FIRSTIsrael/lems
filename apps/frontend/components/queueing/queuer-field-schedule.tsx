import { useState } from 'react';
import { WithId } from 'mongodb';
import Grid from '@mui/material/Grid2';
import { Division, Team, RobotGameMatch, RobotGameTable } from '@lems/types';
import ReportRoundSchedule from '../field/report-round-schedule';

interface QueuerFieldScheduleProps {
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  tables: Array<WithId<RobotGameTable>>;
  matches: Array<WithId<RobotGameMatch>>;
}

const QueuerFieldSchedule: React.FC<QueuerFieldScheduleProps> = ({
  division,
  teams,
  tables,
  matches
}) => {
  const [showGeneralSchedule, setShowGeneralSchedule] = useState<boolean>(true);
  const refereeGeneralSchedule =
    (showGeneralSchedule && division.schedule?.filter(s => s.roles.includes('referee'))) || [];

  const practiceMatches = matches.filter(m => m.stage === 'practice');
  const rankingMatches = matches.filter(m => m.stage === 'ranking');

  const roundSchedules = [...new Set(practiceMatches.flatMap(m => m.round))]
    .map(r => (
      <Grid
        key={'practice' + r}
        size={{
          xs: 12,
          xl: 6
        }}
      >
        <ReportRoundSchedule
          divisionSchedule={refereeGeneralSchedule}
          roundStage="practice"
          roundNumber={r}
          matches={practiceMatches.filter(m => m.round === r)}
          tables={tables}
          teams={teams}
        />
      </Grid>
    ))
    .concat(
      [...new Set(rankingMatches.flatMap(m => m.round))].map(r => (
        <Grid
          key={'ranking' + r}
          size={{
            xs: 12,
            xl: 6
          }}
        >
          <ReportRoundSchedule
            divisionSchedule={refereeGeneralSchedule}
            roundStage="ranking"
            roundNumber={r}
            matches={rankingMatches.filter(m => m.round === r)}
            tables={tables}
            teams={teams}
          />
        </Grid>
      ))
    );

  return (
    <Grid container spacing={2} my={4}>
      {...roundSchedules}
    </Grid>
  );
};

export default QueuerFieldSchedule;
