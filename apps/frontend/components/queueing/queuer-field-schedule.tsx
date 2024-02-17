import { useState } from 'react';
import { WithId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { Event, Team, RobotGameMatch, RobotGameTable } from '@lems/types';
import ReportRoundSchedule from '../field/report-round-schedule';

interface QueuerFieldScheduleProps {
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  tables: Array<WithId<RobotGameTable>>;
  matches: Array<WithId<RobotGameMatch>>;
}

const QueuerFieldSchedule: React.FC<QueuerFieldScheduleProps> = ({
  event,
  teams,
  tables,
  matches
}) => {
  const [showGeneralSchedule, setShowGeneralSchedule] = useState<boolean>(true);
  const refereeGeneralSchedule =
    (showGeneralSchedule && event.schedule?.filter(s => s.roles.includes('referee'))) || [];

  const practiceMatches = matches.filter(m => m.stage === 'practice');
  const rankingMatches = matches.filter(m => m.stage === 'ranking');

  const roundSchedules = [...new Set(practiceMatches.flatMap(m => m.round))]
    .map(r => (
      <Grid xs={12} xl={6} key={'practice' + r}>
        <ReportRoundSchedule
          eventSchedule={refereeGeneralSchedule}
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
        <Grid xs={12} xl={6} key={'ranking' + r}>
          <ReportRoundSchedule
            eventSchedule={refereeGeneralSchedule}
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
