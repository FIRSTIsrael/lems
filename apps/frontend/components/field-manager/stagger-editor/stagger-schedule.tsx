import { WithId } from 'mongodb';
import {
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '@mui/material';
import { Team, RobotGameMatch } from '@lems/types';
import MatchRow from './stagger-schedule-match-row';
import ActionRow from './stagger-schedule-action-row';

interface StaggerScheduleProps {
  teams: Array<WithId<Team>>;
  currentMatch: WithId<RobotGameMatch> | null;
  nextMatch: WithId<RobotGameMatch> | null;
  nextNextMatch: WithId<RobotGameMatch> | null;
}

const StaggerSchedule: React.FC<StaggerScheduleProps> = ({
  teams,
  currentMatch,
  nextMatch,
  nextNextMatch
}) => {
  if (!currentMatch || !nextMatch) {
    return <Typography>לא נותרו מספיק מקצים בסבב הנוכחי.</Typography>;
  }

  const tables = currentMatch.participants.map(participant => participant.tableName);

  return (
    <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'auto', mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">מקצה</TableCell>
            <TableCell align="center">התחלה</TableCell>
            {tables.map((tableName, index) => (
              <TableCell key={index} align="center">
                {`שולחן ${tableName}`}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <MatchRow match={currentMatch} />
          <ActionRow fromMatch={currentMatch} toMatch={nextMatch} teams={teams} allowMerge />
          <MatchRow match={nextMatch} />
          {nextNextMatch && (
            <ActionRow fromMatch={nextMatch} toMatch={nextNextMatch} teams={teams} />
          )}
          {nextNextMatch && <MatchRow match={nextNextMatch} />}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StaggerSchedule;
