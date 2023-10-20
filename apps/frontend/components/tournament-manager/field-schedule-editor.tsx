import { WithId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { Team, RobotGameMatch, RobotGameTable } from '@lems/types';
import RoundScheduleEditor from './round-schedule-editor';

interface FieldScheduleEditorProps {
  teams: Array<WithId<Team>>;
  tables: Array<WithId<RobotGameTable>>;
  matches: Array<WithId<RobotGameMatch>>;
}

const FieldScheduleEditor: React.FC<FieldScheduleEditorProps> = ({ teams, tables, matches }) => {
  const practiceMatches = matches.filter(m => m.stage === 'practice');
  const rankingMatches = matches.filter(m => m.stage === 'ranking');

  const roundSchedules = [...new Set(practiceMatches.flatMap(m => m.round))]
    .map(r => (
      <Grid xs={12} key={'practice' + r}>
        <RoundScheduleEditor
          roundStage={'practice'}
          roundNumber={r}
          matches={practiceMatches.filter(m => m.round === r)}
          tables={tables}
          teams={teams}
        />
      </Grid>
    ))
    .concat(
      [...new Set(rankingMatches.flatMap(m => m.round))].map(r => (
        <Grid xs={12} key={'ranking' + r}>
          <RoundScheduleEditor
            roundStage={'ranking'}
            roundNumber={r}
            matches={rankingMatches.filter(m => m.round === r)}
            tables={tables}
            teams={teams}
          />
        </Grid>
      ))
    );

  return (
    <Grid container spacing={2}>
      {...roundSchedules}
    </Grid>
  );
};

export default FieldScheduleEditor;
